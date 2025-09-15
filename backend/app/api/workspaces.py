from fastapi import APIRouter, Depends, HTTPException
from app.schemas.schemas import WorkspaceCreate, WorkspaceResponse
import uuid
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_db, get_current_user
from app.models import Workspace
from app.schemas.schemas import WorkspaceCreate

router = APIRouter()

_workspaces = {}

@router.post("/")
async def create_workspace(cmd: WorkspaceCreate, db: AsyncSession = Depends(get_db), current=Depends(get_current_user)):
    wid = str(uuid.uuid4())
    ws = Workspace(id=wid, owner_id=current.id, name=cmd.name, layout=cmd.layout, widgets=cmd.widgets)
    db.add(ws)
    await db.commit()
    await db.refresh(ws)
    return ws

@router.get("/")
async def list_workspaces(db: AsyncSession = Depends(get_db), current=Depends(get_current_user)):
    q = await db.execute(select(Workspace).where(Workspace.owner_id == current.id))
    rows = q.scalars().all()
    return rows


@router.get("/{wid}", response_model=WorkspaceResponse)
def get_workspace(wid: str, current=Depends(get_current_user)):
    w = _workspaces.get(current["id"], {}).get(wid)
    if not w:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return w
