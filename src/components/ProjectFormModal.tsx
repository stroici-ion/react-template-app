import { useState } from "react";
import { X } from "lucide-react";
import { useAppDispatch } from "../redux/hooks";
import { createProject, updateProject } from "../redux/projects/asyncThunks";
import type { Project } from "../redux/projects/types";
import Card from "./UI/Card";
import { Input } from "./UI/Input";
import PrimaryButton from "./UI/PrimaryButton";

const COLOR_OPTIONS = [
  "#6366f1",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#64748b",
];

interface ProjectFormModalProps {
  project?: Project;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}

export default function ProjectFormModal({
  project,
  onClose,
  onSuccess,
}: ProjectFormModalProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [colorCode, setColorCode] = useState(
    project?.colorCode ?? COLOR_OPTIONS[0],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!project;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let result: Project;
      if (isEdit) {
        result = await dispatch(
          updateProject({
            id: project.id,
            changes: { name, description, colorCode },
          }),
        ).unwrap();
      } else {
        result = await dispatch(
          createProject({ name, description, colorCode }),
        ).unwrap();
      }
      onSuccess?.(result);
      onClose();
    } catch (e: any) {
      setError(e as string);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <Card maxWidth="xlarge" className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>

          <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-gray-50">
            {isEdit ? "Edit Project" : "New Project"}
          </h2>

          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="project-name"
              label="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is this project about?"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-50">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColorCode(c)}
                    className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${colorCode === c ? "ring-2 ring-gray-400 ring-offset-2" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <PrimaryButton
              text="Cancel"
              outline
              color="gray"
              onClick={onClose}
            />
            <PrimaryButton
              text={isEdit ? "Save Changes" : "Create Project"}
              onClick={handleSubmit}
              loading={submitting}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
