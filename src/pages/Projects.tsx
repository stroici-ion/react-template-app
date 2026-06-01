import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Plus, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchProjects } from "../redux/projects/asyncThunks";
import {
  selectAllProjects,
  selectProjectsLoading,
  selectProjectsPagination,
} from "../redux/projects/selectors";
import ProjectFormModal from "../components/ProjectFormModal";
import Pagination from "../components/UI/Pagination";
import PrimaryButton from "../components/UI/PrimaryButton";
export default function Projects() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const projects = useAppSelector(selectAllProjects);
  const loading = useAppSelector(selectProjectsLoading);
  const pagination = useAppSelector(selectProjectsPagination);
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchProjects({ page }));
  }, [dispatch, page]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 sm:text-2xl">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {pagination
                ? `${pagination.totalCount} project${pagination.totalCount !== 1 ? "s" : ""}`
                : ""}
            </p>
          </div>
          <PrimaryButton
            text="New Project"
            icon={<Plus size={16} />}
            onClick={() => setShowCreate(true)}
          />
        </div>

        {loading && projects.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            Loading…
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 dark:border-gray-700">
            <FolderOpen
              size={40}
              className="mb-3 text-gray-300 dark:text-gray-600"
            />
            <p className="text-sm text-gray-500">
              No projects yet. Create one to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{
                        backgroundColor: project.colorCode ?? "#6366f1",
                      }}
                    />
                    {project.currentUserRole === "admin" && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        Admin
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-gray-50 dark:group-hover:text-indigo-400">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Users size={12} />
                    {project.memberCount} member
                    {project.memberCount !== 1 ? "s" : ""}
                  </div>
                </button>
              ))}
            </div>

            {pagination && (
              <Pagination pagination={pagination} onPageChange={setPage} />
            )}
          </>
        )}
      </main>

      {showCreate && <ProjectFormModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
