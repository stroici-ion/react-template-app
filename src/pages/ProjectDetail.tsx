import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { deleteProject, fetchProject } from "../redux/projects/asyncThunks";
import { selectProjectById } from "../redux/projects/selectors";
import { selectAuth } from "../redux/auth/selectors";
import { TaskList } from "./TaskList";
import MembersList from "../components/MembersList";
import ProjectFormModal from "../components/ProjectFormModal";
import ContextMenu from "../components/UI/ContextMenu";
import MenuOptions from "../components/UI/MenuOptions";
import { fetchUsers } from "../redux/users/asyncThunks";

type Tab = "tasks" | "members";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const project = useAppSelector((state) =>
    selectProjectById(state, projectId),
  );
  const { user } = useAppSelector(selectAuth);
  const [tab, setTab] = useState<Tab>("tasks");
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
      dispatch(fetchUsers({ projectId }));
    }
  }, [dispatch, projectId]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        <div className="flex items-center justify-center py-32 text-gray-400">
          Loading…
        </div>
      </div>
    );
  }

  const isAdmin = project.currentUserRole === "admin";
  const isCreator = project.creatorId === Number(user?.id);

  const handleDelete = async () => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`))
      return;
    try {
      await dispatch(deleteProject(project.id)).unwrap();
      navigate("/projects");
    } catch (e: any) {
      alert(e as string);
    }
  };

  const adminMenuOptions = [
    ...(isAdmin
      ? [
          {
            icon: <Pencil size={15} />,
            title: "Edit Project",
            color:
              "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/30",
            onClick: () => setShowEdit(true),
          },
        ]
      : []),
    ...(isCreator
      ? [
          {
            icon: <Trash2 size={15} />,
            title: "Delete Project",
            color:
              "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30",
            onClick: handleDelete,
          },
        ]
      : []),
  ];

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <button
          onClick={() => navigate("/projects")}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft size={15} /> Back to Projects
        </button>

        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-5 w-5 shrink-0 rounded-full"
              style={{ backgroundColor: project.colorCode ?? "#6366f1" }}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {adminMenuOptions.length > 0 && (
            <ContextMenu
              maxWidth="180px"
              triggerElement={
                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700">
                  <MoreVertical size={18} />
                </button>
              }
              body={<MenuOptions options={adminMenuOptions} />}
            />
          )}
        </div>

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-1">
            <button
              className={tabClass("tasks")}
              onClick={() => setTab("tasks")}
            >
              Tasks
            </button>
            <button
              className={tabClass("members")}
              onClick={() => setTab("members")}
            >
              Members {project.memberCount > 0 && `(${project.memberCount})`}
            </button>
          </nav>
        </div>

        {tab === "tasks" && <TaskList projectId={project.id} />}

        {tab === "members" && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-50">
              Project Members
            </h2>
            <MembersList
              projectId={project.id}
              creatorId={project.creatorId}
              currentUserRole={project.currentUserRole}
            />
          </div>
        )}
      </main>

      {showEdit && (
        <ProjectFormModal
          project={project}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
