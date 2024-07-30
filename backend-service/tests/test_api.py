from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)

# test wave to api route
def test_hello():
    response = client.get("/hello")
    assert response.status_code == 200
    assert response.json() == {"msg": "hello"}