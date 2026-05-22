import { useEffect, useMemo, useState } from 'react';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { ProjectService } from '../services/project.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Users, FolderKanban, CheckSquare, UserPlus, Mail, Trash2, Loader2 } from 'lucide-react';

const emptyEmployeeForm = {
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
};

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [deletingIds, setDeletingIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [projectFilter, setProjectFilter] = useState('ALL');
    const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const [users, projectList, taskList] = await Promise.all([
                AdminService.getUsers(),
                ProjectService.getProjects(),
                AdminService.getAllTasks(),
            ]);
            setEmployees(users || []);
            setProjects(projectList || []);
            setTasks(taskList || []);
        } catch (error) {
            setErrorMessage(error?.response?.data || 'Unable to load employees right now.');
        } finally {
            setIsLoading(false);
        }
    };

    const employeeRows = useMemo(() => {
        return (employees || [])
            .filter((employee) => employee.role === 'EMPLOYEE')
            .map((employee) => {
                const assignedProjects = projects.filter((project) =>
                    (project.members || []).some((member) => String(member.id) === String(employee.id))
                );
                const assignedTasks = tasks.filter((task) => {
                    const assigneeIds = new Set([
                        ...(task.assigneeIds || []).map(String),
                        ...(task.assignees || []).map((assignee) => String(assignee.id)),
                        task.userId ? String(task.userId) : null,
                    ].filter(Boolean));
                    return assigneeIds.has(String(employee.id));
                });
                return {
                    ...employee,
                    assignedProjects,
                    assignedTasks,
                };
            })
            .sort((left, right) => (left.name || '').localeCompare(right.name || ''));
    }, [employees, projects, tasks]);

    const filteredEmployees = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();
        return employeeRows.filter((employee) => {
            const matchesSearch = !normalizedSearch || (employee.name || '').toLowerCase().includes(normalizedSearch);
            const matchesProject =
                projectFilter === 'ALL' ||
                (projectFilter === 'NO_PROJECT'
                    ? employee.assignedProjects.length === 0
                    : employee.assignedProjects.some((project) => String(project.id) === projectFilter));
            const matchesStatus =
                taskStatusFilter === 'ALL' ||
                (taskStatusFilter === 'NO_TASKS'
                    ? employee.assignedTasks.length === 0
                    : employee.assignedTasks.some((task) => task.taskStatus === taskStatusFilter));
            const matchesCategory =
                categoryFilter === 'ALL' ||
                employee.assignedTasks.some((task) => (task.priority || '').toLowerCase() === categoryFilter.toLowerCase());
            return matchesSearch && matchesProject && matchesStatus && matchesCategory;
        });
    }, [employeeRows, searchQuery, projectFilter, taskStatusFilter, categoryFilter]);

    const summary = useMemo(() => ({
        employees: filteredEmployees.length,
        projects: projects.length,
        tasks: tasks.length,
    }), [filteredEmployees.length, projects.length, tasks.length]);

    const clearFilters = () => {
        setSearchQuery('');
        setProjectFilter('ALL');
        setTaskStatusFilter('ALL');
        setCategoryFilter('ALL');
    };

    const handleCreateEmployee = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setErrorMessage('');
        setStatusMessage('');
        try {
            await AuthService.signup({
                ...employeeForm,
                createdByAdmin: true,
            });
            setStatusMessage('Employee created successfully.');
            setEmployeeForm(emptyEmployeeForm);
            setIsCreateOpen(false);
            await loadData();
        } catch (error) {
            setErrorMessage(error?.response?.data || 'Unable to create employee.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivateEmployee = async (employee) => {
        if (!confirm(`Deactivate ${employee.name}?`)) return;
        setErrorMessage('');
        setStatusMessage('');
        setDeletingIds(prev => new Set(prev).add(employee.id));
        try {
            await AdminService.deactivateUser(employee.id);
            setStatusMessage(
                <span>
                    Employee deactivated. <button className="underline" onClick={async () => { await AdminService.restoreUser(employee.id); await loadData(); setStatusMessage('Employee restored.'); }}>Undo</button>
                </span>
            );
            await loadData();
        } catch (error) {
            setErrorMessage(error?.response?.data || 'Unable to deactivate employee.');
        } finally {
            setDeletingIds(prev => {
                const n = new Set(prev);
                n.delete(employee.id);
                return n;
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading employees...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        View every employee, see which projects and tasks belong to them, add new users, or remove an employee when needed.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="shadow-md">
                            <UserPlus size={16} className="mr-2" />
                            Add Employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleCreateEmployee}>
                            <DialogHeader>
                                <DialogTitle>Add Employee</DialogTitle>
                                <DialogDescription>
                                    Create a new employee account. The new user will be assigned the employee role.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="employee-name">Name</Label>
                                    <Input
                                        id="employee-name"
                                        value={employeeForm.name}
                                        onChange={(event) => setEmployeeForm({ ...employeeForm, name: event.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="employee-email">Email</Label>
                                    <Input
                                        id="employee-email"
                                        type="email"
                                        value={employeeForm.email}
                                        onChange={(event) => setEmployeeForm({ ...employeeForm, email: event.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="employee-password">Password</Label>
                                    <Input
                                        id="employee-password"
                                        type="password"
                                        value={employeeForm.password}
                                        onChange={(event) => setEmployeeForm({ ...employeeForm, password: event.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select value={employeeForm.role} onValueChange={(val) => setEmployeeForm({ ...employeeForm, role: val })}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="EMPLOYEE" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Creating...' : 'Create Employee'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Status / Error messages */}
            {statusMessage && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                    {statusMessage}
                </div>
            )}
            {errorMessage && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            )}

            {/* Summary cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Employees</p>
                            <p className="text-3xl font-bold">{summary.employees}</p>
                        </div>
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                            <Users size={24} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Projects</p>
                            <p className="text-3xl font-bold">{summary.projects}</p>
                        </div>
                        <div className="rounded-full bg-blue-500/10 p-3 text-blue-500">
                            <FolderKanban size={24} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Tasks</p>
                            <p className="text-3xl font-bold">{summary.tasks}</p>
                        </div>
                        <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
                            <CheckSquare size={24} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter card — fixed alignment */}
            <Card className="border-none shadow-md bg-card/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle>Filter Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="employee-search">Search</Label>
                            <Input
                                id="employee-search"
                                placeholder="Search by name"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Project</Label>
                            <Select value={projectFilter} onValueChange={setProjectFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="ALL" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">ALL</SelectItem>
                                    <SelectItem value="NO_PROJECT">No project</SelectItem>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={String(project.id)}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Status</Label>
                            <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="ALL" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">ALL</SelectItem>
                                    <SelectItem value="NO_TASKS">No tasks</SelectItem>
                                    <SelectItem value="TODO">To Do</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Category</Label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="ALL" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">ALL</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-3">
                        <span className="text-sm text-muted-foreground">
                            Showing {filteredEmployees.length} of {employeeRows.length} employees
                        </span>
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Employee cards */}
            <div className="grid gap-6 xl:grid-cols-2">
                {filteredEmployees.map((employee) => (
                    <Card key={employee.id} className="border-none shadow-md bg-card/70 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="space-y-4 border-b border-border/60 bg-background/40">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <CardTitle className="text-2xl">{employee.name}</CardTitle>
                                        <Badge variant="outline">{employee.role}</Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-2">
                                        <Mail size={14} />
                                        {employee.email}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeactivateEmployee(employee)}
                                    disabled={deletingIds.has(employee.id)}
                                >
                                    <Trash2 size={14} className="mr-2" />
                                    {deletingIds.has(employee.id) ? 'Working...' : 'Deactivate'}
                                </Button>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <FolderKanban size={14} />
                                        Projects ({employee.assignedProjects.length})
                                    </div>
                                    {employee.assignedProjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {employee.assignedProjects.map((project) => (
                                                <Badge key={project.id} variant="secondary" className="max-w-full truncate">
                                                    {project.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No projects assigned.</p>
                                    )}
                                </div>
                                <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                        <CheckSquare size={14} />
                                        Tasks ({employee.assignedTasks.length})
                                    </div>
                                    {employee.assignedTasks.length > 0 ? (
                                        <div className="space-y-2">
                                            {employee.assignedTasks.slice(0, 4).map((task) => (
                                                <div key={task.id} className="rounded-lg border bg-background/80 px-3 py-2 text-sm">
                                                    <div className="font-medium">{task.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {task.project?.name || task.projectName || 'No project'}
                                                    </div>
                                                </div>
                                            ))}
                                            {employee.assignedTasks.length > 4 && (
                                                <p className="text-xs text-muted-foreground">
                                                    +{employee.assignedTasks.length - 4} more tasks
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No tasks assigned.</p>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}

                {filteredEmployees.length === 0 && (
                    <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
                        <Users size={44} className="mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium">No employees found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add the first employee using the button above.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}