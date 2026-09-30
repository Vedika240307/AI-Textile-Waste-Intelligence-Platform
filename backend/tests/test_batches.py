from .conftest import register_and_login


def test_manufacturer_can_create_batch(client):
    headers = register_and_login(client, "manu1@example.com", role="manufacturer")
    resp = client.post("/api/batches", json={"weight_kg": 12.5, "fabric_type": "Cotton"},
                        headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["batch_code"].startswith("TXT-")
    assert data["status"] == "Pending"


def test_analyst_cannot_create_batch(client):
    headers = register_and_login(client, "analyst1@example.com", role="analyst")
    resp = client.post("/api/batches", json={"weight_kg": 5.0}, headers=headers)
    assert resp.status_code == 403


def test_manufacturer_cannot_edit_others_batch(client):
    headers1 = register_and_login(client, "manuA@example.com", role="manufacturer")
    headers2 = register_and_login(client, "manuB@example.com", role="manufacturer")

    created = client.post("/api/batches", json={"weight_kg": 8.0}, headers=headers1).json()
    resp = client.put(f"/api/batches/{created['id']}", json={"weight_kg": 99.0}, headers=headers2)
    assert resp.status_code == 403


def test_batch_locks_after_processing(client):
    manu = register_and_login(client, "manuC@example.com", role="manufacturer")
    operator = register_and_login(client, "opC@example.com", role="operator")

    created = client.post("/api/batches", json={"weight_kg": 10.0}, headers=manu).json()
    batch_id = created["id"]

    # Operator advances the batch to Processing.
    resp = client.put(f"/api/batches/{batch_id}", json={"status": "Processing"}, headers=operator)
    assert resp.status_code == 200
    assert resp.json()["status"] == "Processing"

    # Manufacturer should no longer be able to edit it.
    resp = client.put(f"/api/batches/{batch_id}", json={"weight_kg": 20.0}, headers=manu)
    assert resp.status_code == 403


def test_operator_cannot_edit_primary_fields(client):
    manu = register_and_login(client, "manuD@example.com", role="manufacturer")
    operator = register_and_login(client, "opD@example.com", role="operator")

    created = client.post("/api/batches", json={"weight_kg": 6.0}, headers=manu).json()
    resp = client.put(f"/api/batches/{created['id']}", json={"weight_kg": 15.0}, headers=operator)
    assert resp.status_code == 403


def test_dashboard_summary(client):
    manu = register_and_login(client, "manuE@example.com", role="manufacturer")
    client.post("/api/batches", json={"weight_kg": 5.0}, headers=manu)
    client.post("/api/batches", json={"weight_kg": 3.0}, headers=manu)

    resp = client.get("/api/dashboard/summary", headers=manu)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_batches"] == 2
    assert data["total_weight_kg"] == 8.0
