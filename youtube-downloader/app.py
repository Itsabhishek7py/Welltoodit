from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from downloader import list_formats, download_video, sanitize_filename
import tempfile
import os

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/formats")
async def api_formats(url: str = Query(...)):
    try:
        info = list_formats(url)
        return JSONResponse(content=info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download")
async def api_download(
    url: str = Query(...),
    format_id: str = Query(...),
    audio: str = Query("false")
):
    extract_audio = audio.lower() == "true"
    tmpdir = tempfile.mkdtemp(prefix="yt_dl_")
    try:
        out_path, filename = download_video(url, format_id, tmpdir, extract_audio=extract_audio)
        if not os.path.exists(out_path):
            raise HTTPException(status_code=500, detail="Download failed")
        return FileResponse(out_path, filename=filename, media_type="application/octet-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # Note: OS cleanup for temp files is still manual or by system

# To run: uvicorn app:app --reload --host 0.0.0.0 --port 5000
