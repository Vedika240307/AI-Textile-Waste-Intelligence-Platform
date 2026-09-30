from .conftest import register_and_login


def test_register_and_login(client):
    resp = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "test1@example.com",
        "password": "Password123!",
        "role": "manufacturer",
    })
    assert resp.status_code == 201

    resp = client.post("/api/auth/login-json", json={
        "email": "test1@example.com",
        "password": "Password123!",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "name": "Test User", "email": "test2@example.com",
        "password": "Password123!", "role": "manufacturer",
    })
    resp = client.post("/api/auth/login-json", json={
        "email": "test2@example.com", "password": "WrongPass!",
    })
    assert resp.status_code == 401


def test_duplicate_email_rejected(client):
    payload = {
        "name": "Dup User", "email": "dup@example.com",
        "password": "Password123!", "role": "manufacturer",
    }
    r1 = client.post("/api/auth/register", json=payload)
    r2 = client.post("/api/auth/register", json=payload)
    assert r1.status_code == 201
    assert r2.status_code == 400


def test_me_requires_token(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_me_with_token(client):
    headers = register_and_login(client, "test3@example.com")
    resp = client.get("/api/auth/me", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "test3@example.com"
