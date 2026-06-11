#!/usr/bin/env python3
"""
ConstructVision AI — Smoke Test
Run this against your deployed backend to verify everything works.

Usage:
  python smoke_test.py                                    # test localhost
  python smoke_test.py https://constructvision-api.onrender.com
"""

import sys
import time
import json
import random
import string
import httpx

BASE_URL = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:8000"
TIMEOUT  = 60  # seconds — Gemini can be slow


def rnd(n=8) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=n))


def check(label: str, condition: bool, detail: str = ""):
    icon = "✅" if condition else "❌"
    print(f"  {icon} {label}" + (f" — {detail}" if detail else ""))
    if not condition:
        print(f"\n     FAILED. Aborting smoke test.")
        sys.exit(1)


def run():
    print(f"\n🔧 ConstructVision AI Smoke Test")
    print(f"   Target: {BASE_URL}\n")

    client = httpx.Client(base_url=BASE_URL, timeout=TIMEOUT)

    # 1. Health check
    print("1. Health check")
    r = client.get("/health")
    check("Status 200",    r.status_code == 200)
    check("Status is ok",  r.json()["status"] == "ok", r.json().get("app", ""))

    # 2. Docs accessible
    print("\n2. API docs")
    r = client.get("/docs")
    check("Swagger UI loads", r.status_code == 200)

    # 3. Register user
    print("\n3. Authentication")
    email    = f"smoketest_{rnd()}@test.com"
    password = "SmokeTest123!"
    r = client.post("/api/v1/auth/register", json={
        "email": email, "name": "Smoke Test User", "password": password
    })
    check("Register 201",     r.status_code == 201, f"email={email}")
    token = r.json()["access_token"]
    check("Got JWT token",    len(token) > 20)

    # 4. Login
    r = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    check("Login 200",        r.status_code == 200)
    token = r.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 5. Get /me
    r = client.get("/api/v1/auth/me", headers=headers)
    check("Get /me 200",      r.status_code == 200)
    check("Email matches",    r.json()["email"] == email)

    # 6. Create project
    print("\n4. Projects")
    r = client.post("/api/v1/projects", headers=headers, json={
        "name": f"Smoke Test Project {rnd(4)}",
        "project_type": "residential",
        "city": "Mumbai",
        "state": "Maharashtra",
        "total_area_sqft": 1500,
        "num_floors": 2,
        "finish_quality": "standard",
        "description": "Automated smoke test project",
    })
    check("Create project 201", r.status_code == 201)
    project_id = r.json()["id"]
    check("Got project ID",     len(project_id) > 10, project_id[:8])

    # 7. Get projects list
    r = client.get("/api/v1/projects", headers=headers)
    check("List projects 200",  r.status_code == 200)
    check("Project in list",    any(p["id"] == project_id for p in r.json()["projects"]))

    # 8. Stats
    r = client.get("/api/v1/projects/stats", headers=headers)
    check("Stats 200",          r.status_code == 200)
    check("Total > 0",          r.json()["total_projects"] >= 1)

    # 9. AI Estimation (the big one)
    print(f"\n5. AI Estimation (calling Gemini — may take 30–45s)")
    t0 = time.time()
    r  = client.post("/api/v1/estimate", headers=headers, json={
        "project_id": project_id, "use_blueprint": False
    })
    elapsed = time.time() - t0
    check("Estimate 201",       r.status_code == 201, f"{elapsed:.1f}s")
    est = r.json()
    check("Has total_cost",     est.get("total_cost", 0) > 0, f"₹{est.get('total_cost',0):,.0f}")
    check("Has BOQ items",      len(est.get("boq_items", [])) >= 10,
          f"{len(est.get('boq_items',[]))} items")
    estimation_id = est["id"]

    # 10. Get latest estimation
    r = client.get(f"/api/v1/estimate/project/{project_id}/latest", headers=headers)
    check("Latest estimation",  r.status_code == 200)

    # 11. Edit a BOQ item
    print("\n6. BOQ editing")
    first_item = est["boq_items"][0]
    r = client.patch(f"/api/v1/estimate/boq/{first_item['id']}", headers=headers,
                     json={"rate": 9999.0})
    check("Edit BOQ item",      r.status_code == 200)
    check("Rate updated",       float(r.json()["rate"]) == 9999.0)

    # 12. Add BOQ item
    r = client.post(f"/api/v1/estimate/{estimation_id}/items", headers=headers, json={
        "category": "civil", "description": "Smoke test custom item",
        "unit": "nos", "quantity": 5, "rate": 500
    })
    check("Add BOQ item 201",   r.status_code == 201)

    # 13. Material schedule
    r = client.get(f"/api/v1/estimate/{estimation_id}/materials", headers=headers)
    check("Material schedule",  r.status_code == 200)

    # 14. Export preview
    print("\n7. Export")
    r = client.get(f"/api/v1/export/preview/{estimation_id}", headers=headers)
    check("Export preview",     r.status_code == 200)
    check("Has PDF URL",        "pdf_url" in r.json())

    # 15. PDF download
    r = client.get(f"/api/v1/export/pdf/{estimation_id}", headers=headers)
    check("PDF download",       r.status_code == 200)
    check("Valid PDF bytes",    r.content[:4] == b"%PDF", f"{len(r.content):,} bytes")

    # 16. Excel download
    r = client.get(f"/api/v1/export/excel/{estimation_id}", headers=headers)
    check("Excel download",     r.status_code == 200)
    check("Valid XLSX bytes",   r.content[:2] == b"PK", f"{len(r.content):,} bytes")

    # 17. Intelligence report
    print("\n8. AI Intelligence Report (another Gemini call)")
    t0 = time.time()
    r  = client.get(f"/api/v1/intelligence/report/{project_id}", headers=headers)
    elapsed = time.time() - t0
    check("Intelligence report",   r.status_code == 200, f"{elapsed:.1f}s")
    report = r.json()
    check("Has executive summary", len(report.get("executive_summary","")) > 50)
    check("Has risks",             len(report.get("risk_assessment",{}).get("risks",[])) >= 1)
    check("Has recommendations",   len(report.get("recommendations",[])) >= 2)

    # 18. Project comparison
    print("\n9. Project Comparison")
    # Create a second project
    r2 = client.post("/api/v1/projects", headers=headers, json={
        "name": f"Compare Project {rnd(4)}", "project_type": "commercial",
        "city": "Delhi", "state": "Delhi", "total_area_sqft": 3000,
        "num_floors": 5, "finish_quality": "premium",
    })
    check("Second project 201", r2.status_code == 201)
    pid2 = r2.json()["id"]

    r = client.post("/api/v1/intelligence/compare", headers=headers,
                    json={"project_ids": [project_id, pid2]})
    check("Compare 200",        r.status_code == 200)
    check("Returns 2 projects", r.json()["count"] == 2)

    # 19. Delete project (cleanup)
    print("\n10. Cleanup")
    r = client.delete(f"/api/v1/projects/{project_id}", headers=headers)
    check("Delete project 204", r.status_code == 204)

    # Done
    print(f"\n{'='*50}")
    print(f"🎉 ALL CHECKS PASSED — ConstructVision AI is production ready!")
    print(f"{'='*50}\n")
    print(f"   API URL:      {BASE_URL}")
    print(f"   API Docs:     {BASE_URL}/docs")
    print(f"   Test account: {email} / {password}")
    print()


if __name__ == "__main__":
    run()
