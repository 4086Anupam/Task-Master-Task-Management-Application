import { useEffect, useMemo, useState } from 'react';
import useDashboardStore from '../store/dashboardStore';
import useTaskStore from '../store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FolderKanban, CheckSquare, Clock, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const { summary, projectsProgress, fetchSummary, fetchProjectsProgress, isLoading } = useDashboardStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');

  useEffect(() => {
    fetchSummary();
    fetchProjectsProgress();
    fetchTasks();
  }, [fetchSummary, fetchProjectsProgress, fetchTasks]);

  const assigneeOptions = useMemo(() => {
    const uniqueAssignees = new Map();

    tasks.forEach((task) => {
      (task.assignees || []).forEach((assignee) => {
        const assigneeId = String(assignee.id);
        if (!uniqueAssignees.has(assigneeId)) {
          uniqueAssignees.set(assigneeId, assignee);
        }
      });
    });

    return Array.from(uniqueAssignees.values()).sort((left, right) => (left.name || '').localeCompare(right.name || ''));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === 'ALL' || task.taskStatus === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || task.priority?.toLowerCase() === priorityFilter.toLowerCase();
      const taskAssigneeIds = (task.assignees || []).map((assignee) => String(assignee.id));
      const matchesAssignee =
        assigneeFilter === 'ALL' ||
        (assigneeFilter === 'UNASSIGNED'
          ? taskAssigneeIds.length === 0
          : taskAssigneeIds.includes(assigneeFilter));

      return matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, statusFilter, priorityFilter, assigneeFilter]);

  const resetFilters = () => {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setAssigneeFilter('ALL');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (isLoading || !summary) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const stats = [
    { name: 'Total Projects', value: summary.totalProjects, icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Total Tasks', value: summary.totalTasks, icon: LayoutDashboard, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Completed Tasks', value: summary.completedTasks, icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'In Progress Tasks', value: summary.inProgressTasks, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's an overview of your workspace.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-none shadow-md bg-card/50 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-none shadow-md bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle>Filter Tasks</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4 items-end">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All assignees</SelectItem>
                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                {assigneeOptions.map((assignee) => (
                  <SelectItem key={assignee.id} value={String(assignee.id)}>
                    {assignee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 md:justify-end">
            <div className="text-sm text-muted-foreground">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
            <Button variant="outline" onClick={resetFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {projectsProgress.map((project) => (
              <div key={project.projectId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{project.projectName}</span>
                  <span className="text-sm text-muted-foreground">{Math.round(project.progressPercentage)}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${project.progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{project.completedTasks} completed</span>
                  <span>{project.pendingTasks} remaining</span>
                </div>
              </div>
            ))}
            {projectsProgress.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No projects found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Filtered Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[32rem] overflow-y-auto">
            {tasksLoading && (
              <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
            )}

            {!tasksLoading && filteredTasks.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">No tasks match the selected filters.</div>
            )}

            {!tasksLoading && filteredTasks.map((task) => (
              <div key={task.id} className="rounded-xl border p-4 space-y-3 bg-background/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold leading-none">{task.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(task.taskStatus)}>
                    {task.taskStatus?.replace('_', ' ') || 'TODO'}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority || 'Normal'}
                  </Badge>
                  <Badge variant="outline">{task.project?.name || task.projectName || 'No project'}</Badge>
                  {(task.assignees || []).length > 0 ? (
                    task.assignees.map((assignee) => (
                      <Badge key={assignee.id} variant="outline">{assignee.name}</Badge>
                    ))
                  ) : (
                    <Badge variant="outline">Unassigned</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
