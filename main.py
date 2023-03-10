from deta import Deta
from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response


class ContentResponse(Response):
    def __init__(self, path: str, **kwargs):
        with open(path, "rb") as f:
            super().__init__(content=f.read(), **kwargs)
               
app = FastAPI()
db = Deta().Base('codebin')
app.add_middleware(CORSMiddleware, allow_origins=["*"])

@app.get("/")
def index():
    return ContentResponse("./static/index.html", media_type="text/html")

@app.get("/{code}")
def view():
    return ContentResponse("./static/view.html", media_type="text/html")

@app.get("/file/{code}")
def file():
    return ContentResponse("./static/file.html", media_type="text/html")

@app.get("/api/files/{code}")
def fetch(code: str):
    return JSONResponse([db.get(code)])

@app.get("/api/bins/{code}")
def fetch(code: str):
    fetched = db.fetch({"parent": code})
    last = fetched.last
    items = fetched.items
    while last:
        fetched = db.fetch({"parent": code}, last=last)
        items += fetched.items
        last = fetched.last
    return JSONResponse(fetched.items)

@app.post("/api/bins/{code}")
async def store(request: Request, code: str):
    data = await request.json()
    return JSONResponse(db.put(data, code))

@app.delete("/api/bins/{code}")
def delete(code: str):
    return db.delete(code)

@app.get("/modes/{name}")
def file(name: str):
    return ContentResponse(f"./modes/{name}", media_type="application/octet-stream")

@app.get("/assets/{name}")
def file(name: str):
    return ContentResponse(f"./assets/{name}", media_type="application/octet-stream")

@app.get("/scripts/{name}")
def file(name: str):
    return ContentResponse(f"./scripts/{name}", media_type="text/javascript")

@app.get("/styles/{name}")
def file(name: str):
    return ContentResponse(f"./styles/{name}", media_type="text/css")
