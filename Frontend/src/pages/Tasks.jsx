import { useEffect, useState } from 'react';
import useTaskStore from '../store/taskStore';
import useProjectStore from '../store/projectStore';
import useAuthStore from '../store/authStore';
import { ProjectService } from '../services/project.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, closestCenter, useDroppable, useDraggable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Calendar, Plus, GripVertical, Pencil, Trash2, Users } from 'lucide-react';

const emptyTaskForm = {
  title: '',
  description: '',
  priority: 'Medium',
  taskStatus: 'TODO',
  projectId: '',
  dueDate: ''
};

function TaskDraggableCard({ task, isAdmin, onOpenEdit, onDelete, onStatusChange, getPriorityColor, isActive }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(task.id),
    data: { type: 'task' }
  });

  return (
    <div
      ref={setNodeRef}
      className="cursor-grab active:cursor-grabbing"
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `${CSS.Transform.toString(transform)} ${isActive ? 'scale(0.98)' : ''}` : isActive ? 'scale(0.98)' : undefined,
        transition: 'transform 150ms ease',
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none'
      }}
    >
      <Card className="group border shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-card">
        <div className={`absolute top-0 left-0 w-1 h-full ${
          task.priority?.toLowerCase() === 'high' ? 'bg-red-500' :
          task.priority?.toLowerCase() === 'medium' ? 'bg-orange-500' : 'bg-green-500'
        }`} />
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-3">
            <Badge variant="outline" className={`mb-2 text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority || 'Normal'}
            </Badge>

            <div className="flex items-center gap-1">
              {isAdmin && (
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => onOpenEdit(task)}>
                  <Pencil size={14} />
                </Button>
              )}
              <Select value={task.taskStatus} onValueChange={(val) => onStatusChange(task.id, val)}>
                <SelectTrigger className="h-6 w-8 p-0 border-none bg-transparent shadow-none">
                  <GripVertical size={14} className="text-muted-foreground opacity-50 group-hover:opacity-100" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs mt-1">{task.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-3 text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Users size={12} className="mt-0.5" />
              <span className="flex flex-wrap gap-1">
                {(task.assignees || []).length > 0
                  ? task.assignees.map(assignee => (
                      <Badge key={assignee.id} variant="outline" className="text-[10px]">
                        {assignee.name}
                      </Badge>
                    ))
                  : <span>No employees assigned</span>}
              </span>
            </div>
            {isAdmin && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => onDelete(task.id)}>
                  <Trash2 size={12} className="mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskColumn({ column, tasks, isAdmin, onOpenEdit, onDelete, onStatusChange, getPriorityColor, activeTaskId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column' }
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-muted/30 rounded-xl p-4 border border-border overflow-hidden h-full transition-colors ${isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider">{column.title}</h3>
        <Badge variant="outline" className={column.color}>
          {tasks.length}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskDraggableCard
              key={task.id}
              task={task}
              isAdmin={isAdmin}
              onOpenEdit={onOpenEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              getPriorityColor={getPriorityColor}
              isActive={activeTaskId === task.id}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Drop tasks here.
          </div>
        )}
      </div>
    </div>
  );
}

function TaskPreviewCard({ task, getPriorityColor }) {
  if (!task) return null;

  return (
    <Card className="group relative overflow-hidden border-2 border-border/70 bg-card shadow-2xl ring-2 ring-primary/20 w-[min(28rem,calc(100vw-2rem))]">
      <div className={`absolute top-0 left-0 w-1 h-full ${
        task.priority?.toLowerCase() === 'high' ? 'bg-red-500' :
        task.priority?.toLowerCase() === 'medium' ? 'bg-orange-500' : 'bg-green-500'
      }`} />
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-3">
          <Badge variant="outline" className={`mb-2 text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority || 'Normal'}
          </Badge>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/70 text-muted-foreground">
            <GripVertical size={14} />
          </div>
        </div>
        <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-xs mt-1">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-3 text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <Users size={12} className="mt-0.5" />
            <span className="flex flex-wrap gap-1">
              {(task.assignees || []).length > 0
                ? task.assignees.map(assignee => (
                    <Badge key={assignee.id} variant="outline" className="text-[10px]">
                      {assignee.name}
                    </Badge>
                  ))
                : <span>No employees assigned</span>}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Tasks() {
  const { tasks, fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState(emptyTaskForm);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [projectMembersLoading, setProjectMembersLoading] = useState(false);
  const [projectMembersError, setProjectMembersError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTask, setEditTask] = useState(emptyTaskForm);
  const [editAssigneeIds, setEditAssigneeIds] = useState([]);
  const [editProjectMembers, setEditProjectMembers] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  const loadProjectMembers = async (projectId, setMembers, setLoading, setError) => {
    setLoading?.(true);
    setError?.('');

    if (!projectId) {
      setMembers([]);
      setLoading?.(false);
      return;
    }

    try {
      const projectData = await ProjectService.getProjectById(projectId);
      setMembers(projectData.members || []);
    } catch (error) {
      setMembers([]);
      setError?.(error?.response?.data || 'Unable to load employees for this project.');
    } finally {
      setLoading?.(false);
    }
  };

  const handleCreateProjectChange = async (projectId) => {
    setNewTask(prev => ({ ...prev, projectId }));
    setSelectedAssigneeIds([]);
    await loadProjectMembers(projectId, setProjectMembers, setProjectMembersLoading, setProjectMembersError);
  };

  const toggleCreateAssignee = (userId) => {
    setSelectedAssigneeIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleEditAssignee = (userId) => {
    setEditAssigneeIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createTask({
      ...newTask,
      projectId: Number(newTask.projectId),
      assigneeIds: selectedAssigneeIds.map(Number)
    });
    setIsCreateOpen(false);
    setNewTask(emptyTaskForm);
    setSelectedAssigneeIds([]);
    setProjectMembers([]);
  };

  const openEditTask = async (task) => {
    const taskProjectId = task.project?.id ?? task.projectId ?? '';
    const taskAssigneeIds = task.assigneeIds ?? task.assignees?.map(assignee => assignee.id) ?? (task.userId ? [task.userId] : []);

    setEditingTask(task);
    setEditTask({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'Medium',
      taskStatus: task.taskStatus || 'TODO',
      projectId: taskProjectId ? String(taskProjectId) : '',
      dueDate: task.dueDate ? String(task.dueDate) : ''
    });
    setEditAssigneeIds(taskAssigneeIds.map(id => String(id)));
    setIsEditOpen(true);
    await loadProjectMembers(taskProjectId, setEditProjectMembers);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    await updateTask(editingTask.id, {
      ...editTask,
      projectId: Number(editTask.projectId),
      assigneeIds: editAssigneeIds.map(Number)
    });

    setIsEditOpen(false);
    setEditingTask(null);
    setEditTask(emptyTaskForm);
    setEditAssigneeIds([]);
    setEditProjectMembers([]);
  };

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { id: 'DONE', title: 'Done', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
  ];

  const handleTaskStatusChange = async (taskId, columnId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.taskStatus === columnId) return;
    await updateTaskStatus(taskId, columnId);
  };

  const handleDragStart = (event) => {
    setActiveTaskId(Number(event.active.id));
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const taskId = Number(active.id);
    const columnId = String(over.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task || task.taskStatus === columnId) return;
    if (!columns.some(column => column.id === columnId)) return;

    await updateTaskStatus(taskId, columnId);
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-muted-foreground mt-2">Drag and drop tasks between columns on the Kanban board.</p>
        </div>

        {isAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-md">
                <Plus size={16} className="mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                  <DialogDescription>
                    Choose a project first, then assign one or more employees from that project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={newTask.taskStatus} onValueChange={v => setNewTask({ ...newTask, taskStatus: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODO">To Do</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select value={newTask.projectId} onValueChange={handleCreateProjectChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Employees</Label>
                    {projectMembersLoading ? (
                      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Loading employees...
                      </div>
                    ) : projectMembersError ? (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        {projectMembersError}
                      </div>
                    ) : projectMembers.length > 0 ? (
                      <div className="max-h-44 overflow-y-auto space-y-2 rounded-lg border p-3">
                        {projectMembers.map(member => (
                          <label key={member.id} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer">
                            <Checkbox checked={selectedAssigneeIds.includes(member.id)} onCheckedChange={() => toggleCreateAssignee(member.id)} />
                            <span className="grid gap-0.5">
                              <span className="text-sm font-medium leading-none">{member.name}</span>
                              <span className="text-xs text-muted-foreground">{member.email}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Select a project to load its employees.
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!newTask.projectId || selectedAssigneeIds.length === 0}>
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 grid gap-6 md:grid-cols-3 overflow-hidden min-h-0">
          {columns.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={tasks.filter(t => t.taskStatus === column.id)}
              isAdmin={isAdmin}
              onOpenEdit={openEditTask}
              onDelete={deleteTask}
              onStatusChange={handleTaskStatusChange}
              getPriorityColor={getPriorityColor}
              activeTaskId={activeTaskId}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null} zIndex={60}>
          {activeTaskId ? (
            <div className="pointer-events-none select-none">
              <TaskPreviewCard
                task={tasks.find(task => task.id === activeTaskId)}
                getPriorityColor={getPriorityColor}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isAdmin && editingTask && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-xl sm:scale-[0.96] max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <form onSubmit={handleUpdateTask}>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update the task details, assignees, status, due date, or category.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input id="edit-title" value={editTask.title} onChange={e => setEditTask({ ...editTask, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea id="edit-description" value={editTask.description} onChange={e => setEditTask({ ...editTask, description: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={editTask.priority} onValueChange={v => setEditTask({ ...editTask, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editTask.taskStatus} onValueChange={v => setEditTask({ ...editTask, taskStatus: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={editTask.dueDate} onChange={e => setEditTask({ ...editTask, dueDate: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Employees</Label>
                  {editProjectMembers.length > 0 ? (
                    <div className="h-32 overflow-y-auto overscroll-contain space-y-2 rounded-lg border p-2.5 pr-1">
                      {editProjectMembers.map(member => (
                        <label key={member.id} className="flex items-start gap-3 rounded-md p-1.5 hover:bg-muted/50 cursor-pointer">
                          <Checkbox checked={editAssigneeIds.includes(String(member.id))} onCheckedChange={() => toggleEditAssignee(member.id)} />
                          <span className="grid gap-0.5">
                            <span className="text-sm font-medium leading-none">{member.name}</span>
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                      No employees are assigned to this project yet.
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={editAssigneeIds.length === 0}>
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
