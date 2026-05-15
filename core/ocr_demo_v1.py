import logging
from pathlib import Path
from chrome_lens_py import LensAPI
import pdfplumber

logger = logging.getLogger(__name__)


class DocumentPipeline:

    def __init__(self, ocr_language: str = "en"):
        self.ocr_language = ocr_language
        self.api = LensAPI(max_concurrent=5)
    
    async def process(self, file_path: Path | str) -> str:
        """Process image or PDF and return extracted text."""
        file_path = Path(file_path)
        
        if file_path.suffix.lower() == ".pdf":
            return await self._process_pdf(file_path)
        else:
            return await self._process_image(file_path)
    
    async def _process_image(self, file_path: Path) -> str:
        """Extract text from image using Chrome Lens API."""
        result = await self.api.process_image(
            image_path=str(file_path),
            ocr_language=self.ocr_language
        )
        return result.get("ocr_text", "").strip()
    
    async def _process_pdf(self, file_path: Path) -> str:
        """Extract text from PDF pages."""
        pages_text = []
        
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text() or ""
                pages_text.append(f"--- Page {page_num} ---\n{text}")
        
        return "\n\n".join(pages_text)
