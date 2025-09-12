# file: app/api/workspaces.py
from fastapi import APIRouter, Depends
from app.schemas.schemas import WorkspaceCreate, WorkspaceResponse
from app.deps import get_current_user
import uuid

router = APIRouter()

# in-memory workspace store per user
_workspaces = {}

@router.post("/", response_model=WorkspaceResponse)
def create_workspace(cmd: WorkspaceCreate, current=Depends(get_current_user)):
    wid = str(uuid.uuid4())
    owner = current["id"]
    obj = {"id": wid, "owner_id": owner, "name": cmd.name, "layout": cmd.layout, "widgets": cmd.widgets}
    _workspaces.setdefault(owner, {})[wid] = obj
    return obj

@router.get("/", response_model=list[WorkspaceResponse])
def list_workspaces(current=Depends(get_current_user)):
    return list(_workspaces.get(current["id"], {}).values())

@router.get("/{wid}", response_model=WorkspaceResponse)
def get_workspace(wid: str, current=Depends(get_current_user)):
    w = _workspaces.get(current["id"], {}).get(wid)
    if not w:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return w
