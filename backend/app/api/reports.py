# file: app/api/reports.py
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db, get_current_user
from app.models import Report
from app.schemas.schemas import ReportRequest
import uuid, asyncio

router = APIRouter()

@router.post("/generate")
async def generate_report(req: ReportRequest, background: BackgroundTasks, db: AsyncSession = Depends(get_db), current=Depends(get_current_user)):
    rid = str(uuid.uuid4())
    rep = Report(id=rid, owner_id=current.id, template=req.template, workspace_id=req.workspace_id, format=req.format, status="pending")
    db.add(rep)
    await db.commit()
    await db.refresh(rep)

    # enqueue background task: we'll simulate saving S3 URL after some async work
    async def _generate_and_mark(report_id: str):
        await asyncio.sleep(2)  # simulate long work / call to report engine
        # mark report ready
        r = await db.get(Report, report_id)
        if r:
            r.status = "ready"
            r.s3_url = f"https://example-bucket.s3.local/{report_id}.{r.format}"
            await db.commit()
    background.add_task(asyncio.create_task, _generate_and_mark(rid))
    return {"report_id": rid, "status": "pending"}

@router.get("/download/{report_id}")
async def download_report(report_id: str, db: AsyncSession = Depends(get_db), current=Depends(get_current_user)):
    r = await db.get(Report, report_id)
    if not r or r.owner_id != current.id:
        raise HTTPException(status_code=404, detail="report not found")
    if r.status != "ready":
        raise HTTPException(status_code=400, detail="not ready")
    return {"s3_url": r.s3_url}
