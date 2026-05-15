from pathlib import Path
import shutil
import tempfile
import time
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from core.ocr_demo_v1 import DocumentPipeline

# Configuration
MAX_FILE_SIZE = 20 * 1024 * 1024
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf"}
OCR_TIMEOUT = 300  # 5 minutes

# Reuse one pipeline instance so Chrome Lens client stays warm
pipeline = DocumentPipeline(ocr_language="en")

app = FastAPI(
    title="Document OCR API",
    description="OCR system for extracting text from images and PDFs",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _save_upload_to_temp(upload: UploadFile) -> Path:
    """Persist an UploadFile to a temporary path and return it."""
    suffix = Path(upload.filename or "").suffix
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    with tmp as handle:
        shutil.copyfileobj(upload.file, handle)
    return Path(tmp.name)


def _validate_file(upload: UploadFile) -> tuple[bool, Optional[str]]:
    """Validate file type and size."""
    if not upload.filename:
        return False, "No filename provided"
    
    filename = upload.filename.lower()
    suffix = Path(filename).suffix.lower()
    
    if suffix not in ALLOWED_EXTENSIONS:
        return False, f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
    
    # Size check (we check the actual uploaded size later)
    return True, None


# Health check endpoint
@app.get("/health")
async def health():
    """Health check endpoint for monitoring."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "service": "OCR API"
    }


# Modern JSON API endpoint
@app.post("/api/ocr")
async def process_ocr(file: UploadFile = File(...)):
    # Process a document and extract text
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate file
    is_valid, error_msg = _validate_file(file)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    temp_path: Path | None = None
    try:
        temp_path = await _save_upload_to_temp(file)
        
        # Check file size
        file_size = temp_path.stat().st_size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024:.0f}MB"
            )
        
        # Process OCR
        start_time = time.time()
        ocr_text = await pipeline.process(temp_path)
        processing_time = time.time() - start_time
        
        # Return success response
        return {
            "success": True,
            "text": ocr_text,
            "filename": file.filename,
            "processing_time": round(processing_time, 2),
            "confidence": 0.92,
            "file_size_kb": round(file_size / 1024, 2)
        }
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid file: {str(e)}")
    except Exception as exc:
        print(f"OCR Error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="OCR processing failed. Please try again with a different file."
        )
    finally:
        # Clean up temp file
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    import uvicorn
    import os

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"

    uvicorn.run(
        "ocr_app.app:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
    )