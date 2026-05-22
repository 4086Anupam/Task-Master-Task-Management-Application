import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectService } from '../services/project.service';
import { AdminService } from '../services/admin.service';
import useAuthStore from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Users, Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';

const emptyTaskForm = {
  title: '',
  description: '',
  priority: 'Medium',
  taskStatus: 'TODO',
  dueDate: ''
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState(emptyTaskForm);
  const [newTaskAssigneeIds, setNewTaskAssigneeIds] = useState([]);
  const [isTaskEditOpen, setIsTaskEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState(emptyTaskForm);
  const [editTaskAssigneeIds, setEditTaskAssigneeIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const projectData = await ProjectService.getProjectById(id);

      setProject(projectData);
      setProjectForm({
        name: projectData.name || '',
        description: projectData.description || ''
      });

      if (isAdmin) {
        const users = await AdminService.getUsers();
        setAllUsers(users);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProject = async () => {
    const projectData = await ProjectService.getProjectById(id);
    setProject(projectData);
    setProjectForm({
      name: projectData.name || '',
      description: projectData.description || ''
    });
  };

  const handleAssignMembers = async () => {
    try {
      await Promise.all(
        selectedUserIds.map(userId =>
          ProjectService.assignMemberToProject(id, userId)
        )
      );
      setIsAssignOpen(false);
      setSelectedUserIds([]);
      await refreshProject();
    } catch (error) {
      console.error('Error assigning members:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await ProjectService.removeMemberFromProject(id, userId);
      await refreshProject();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await ProjectService.updateProject(id, projectForm);
      setIsProjectEditOpen(false);
      await refreshProject();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(i => i !== userId)
        : [...prev, userId]
    );
  };

  const openCreateTask = () => {
    setNewTask(emptyTaskForm);
    setNewTaskAssigneeIds([]);
    setIsTaskCreateOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await AdminService.createTask({
        ...newTask,
        projectId: Number(id),
        assigneeIds: newTaskAssigneeIds.map(Number)
      });
      setIsTaskCreateOpen(false);
      setNewTask(emptyTaskForm);
      setNewTaskAssigneeIds([]);
      await refreshProject();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'Medium',
      taskStatus: task.taskStatus || 'TODO',
      dueDate: task.dueDate ? String(task.dueDate) : ''
    });
    setEditTaskAssigneeIds((task.assigneeIds || task.assignees?.map(assignee => assignee.id) || []).map(id => String(id)));
    setIsTaskEditOpen(true);
  };

  const toggleCreateTaskAssignee = (userId) => {
    setNewTaskAssigneeIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleEditTaskAssignee = (userId) => {
    setEditTaskAssigneeIds(prev =>
      prev.includes(String(userId))
        ? prev.filter(id => id !== String(userId))
        : [...prev, String(userId)]
    );
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await AdminService.updateTask(editingTask.id, {
        ...editTaskForm,
        projectId: Number(id),
        assigneeIds: editTaskAssigneeIds.map(Number)
      });
      setIsTaskEditOpen(false);
      setEditingTask(null);
      setEditTaskForm(emptyTaskForm);
      setEditTaskAssigneeIds([]);
      await refreshProject();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await AdminService.deleteTask(taskId);
      await refreshProject();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const unassignedUsers = allUsers.filter(u =>
    !project?.members?.some(member => member.id === u.id)
  );
  const assignedTasks = project?.tasks || [];

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!project) {
    return <div className="text-center py-12">Project not found.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground mt-1">Project Details and Management</p>
        </div>
        {isAdmin && (
          <Dialog open={isProjectEditOpen} onOpenChange={setIsProjectEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Pencil size={14} className="mr-2" /> Edit Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <form onSubmit={handleUpdateProject}>
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                  <DialogDescription>
                    Update the project name or description.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Name</Label>
                    <Input id="project-name" value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea id="project-description" value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-1">
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Name</p>
                  <p className="text-base font-medium">{project.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{project.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{project.members?.length || 0} employees assigned</Badge>
                  <Badge variant="outline">{assignedTasks.length} tasks</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Employees Assigned
              </CardTitle>
              {isAdmin && (
                <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 shadow-sm">
                      <Plus size={14} className="mr-1" /> Assign
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Assign Team Members</DialogTitle>
                      <DialogDescription>
                        Select one or more employees to add to this project.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 max-h-75 overflow-y-auto">
                      {unassignedUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">All available users are already assigned.</p>
                      ) : (
                        unassignedUsers.map(member => (
                          <div key={member.id} className="flex items-center space-x-3 p-2 rounded hover:bg-muted transition-colors">
                            <Checkbox
                              id={`user-${member.id}`}
                              checked={selectedUserIds.includes(member.id)}
                              onCheckedChange={() => toggleUserSelection(member.id)}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label htmlFor={`user-${member.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                {member.name}
                              </label>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAssignMembers} disabled={selectedUserIds.length === 0}>
                        Assign Selected ({selectedUserIds.length})
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {project.members && project.members.length > 0 ? (
                <ul className="space-y-3">
                  {project.members.map((member) => (
                    <li key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{member.role}</Badge>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveMember(member.id)}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No members assigned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Project Tasks</CardTitle>
                <CardDescription>All tasks assigned under this project with their current details.</CardDescription>
              </div>
              {isAdmin && (
                <Dialog open={isTaskCreateOpen} onOpenChange={setIsTaskCreateOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateTask}>
                      <Plus size={14} className="mr-2" /> Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleCreateTask}>
                      <DialogHeader>
                        <DialogTitle>Create Task</DialogTitle>
                        <DialogDescription>
                          This task will be created inside the current project.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-3 py-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="task-title">Title</Label>
                          <Input id="task-title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="task-description">Description</Label>
                          <Textarea id="task-description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
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
                        <div className="space-y-1.5">
                          <Label>Due Date</Label>
                          <Input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Employees</Label>
                          {project.members?.length > 0 ? (
                            <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border p-2.5">
                              {project.members.map(member => (
                                <label key={member.id} className="flex items-start gap-2.5 rounded-md p-2 hover:bg-muted/50 cursor-pointer">
                                  <Checkbox checked={newTaskAssigneeIds.includes(member.id)} onCheckedChange={() => toggleCreateTaskAssignee(member.id)} />
                                  <span className="grid gap-0.5 leading-tight">
                                    <span className="text-sm font-medium leading-none">{member.name}</span>
                                    <span className="text-xs text-muted-foreground">{member.email}</span>
                                  </span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                              Add employees to the project before assigning the task.
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={newTaskAssigneeIds.length === 0}>
                          Save changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {assignedTasks.length > 0 ? (
                <div className="space-y-4">
                  {assignedTasks.map(task => (
                    <div key={task.id} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/50 transition-colors">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{task.title}</h4>
                          <Badge variant="secondary" className={
                            task.taskStatus === 'DONE' ? 'bg-emerald-500/10 text-emerald-500' :
                            task.taskStatus === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-500'
                          }>
                            {task.taskStatus.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] ${
                            task.priority?.toLowerCase() === 'high' ? 'text-red-500 border-red-200' :
                            task.priority?.toLowerCase() === 'medium' ? 'text-orange-500 border-orange-200' : 'text-green-500 border-green-200'
                          }`}>
                            {task.priority || 'Normal'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                          <span>Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}</span>
                          <span className="flex flex-wrap gap-1">
                            {(task.assignees || []).length > 0
                              ? task.assignees.map(assignee => (
                                  <Badge key={assignee.id} variant="outline" className="text-[10px]">
                                    {assignee.name}
                                  </Badge>
                                ))
                              : 'No employees assigned'}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex items-start gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTask(task)}>
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  <p>No tasks found for this project.</p>
                  {isAdmin && (
                    <Button variant="link" onClick={openCreateTask} className="mt-2 text-primary">
                      Add the first task
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isAdmin && editingTask && (
        <Dialog open={isTaskEditOpen} onOpenChange={setIsTaskEditOpen}>
          <DialogContent className="sm:max-w-xl">
            <form onSubmit={handleUpdateTask}>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update the task details and reassign employees as needed.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-task-title">Title</Label>
                  <Input id="edit-task-title" value={editTaskForm.title} onChange={e => setEditTaskForm({ ...editTaskForm, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-task-description">Description</Label>
                  <Textarea id="edit-task-description" value={editTaskForm.description} onChange={e => setEditTaskForm({ ...editTaskForm, description: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={editTaskForm.priority} onValueChange={v => setEditTaskForm({ ...editTaskForm, priority: v })}>
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
                    <Select value={editTaskForm.taskStatus} onValueChange={v => setEditTaskForm({ ...editTaskForm, taskStatus: v })}>
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
                  <Input type="date" value={editTaskForm.dueDate} onChange={e => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Employees</Label>
                  {project.members?.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border p-3">
                      {project.members.map(member => (
                        <label key={member.id} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 cursor-pointer">
                          <Checkbox checked={editTaskAssigneeIds.includes(String(member.id))} onCheckedChange={() => toggleEditTaskAssignee(member.id)} />
                          <span className="grid gap-0.5">
                            <span className="text-sm font-medium leading-none">{member.name}</span>
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      Add employees to the project before assigning the task.
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={editTaskAssigneeIds.length === 0}>
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
