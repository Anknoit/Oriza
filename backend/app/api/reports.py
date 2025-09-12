# file: app/api/reports.py
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from app.schemas.schemas import ReportRequest, ReportResponse
from app.deps import get_current_user
import uuid
from time import sleep
from typing import Dict

router = APIRouter()

_reports: Dict[str, dict] = {}

def _generate_report_sync(report_id: str, template: str, workspace_id: str, fmt: str):
    """
    Synchronous simulation of a long-running report generation task.
    In production replace with a proper background worker that writes to S3/MinIO.
    """
    # simulate heavy work
    sleep(2)
    _reports[report_id] = {
        "id": report_id,
        "status": "ready",
        "download_url": f"/reports/download/{report_id}.{fmt}"
    }

@router.post("/generate", response_model=ReportResponse)
def generate_report(
    req: ReportRequest,
    background: BackgroundTasks,
    current=Depends(get_current_user),
):
    """
    Enqueue a report generation task. Uses FastAPI BackgroundTasks for demo.
    In production: push to Celery/RQ and return job id.
    """
    rid = str(uuid.uuid4())
    _reports[rid] = {"id": rid, "status": "pending"}
    # enqueue background task (FastAPI-managed for the request lifecycle)
    background.add_task(_generate_report_sync, rid, req.template, req.workspace_id or "", req.format)
    return ReportResponse(report_id=rid, status="pending")

@router.get("/download/{report_id}.{ext}")
def download_stub(report_id: str, ext: str):
    rep = _reports.get(report_id)
    if not rep or rep.get("status") != "ready":
        raise HTTPException(status_code=404, detail="Report not ready")
    # In prod return FileResponse or signed S3 URL
    return {"report_id": report_id, "download": f"stub://{report_id}.{ext}"}
