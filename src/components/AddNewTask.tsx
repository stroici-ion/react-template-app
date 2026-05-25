import { Plus, Save } from "lucide-react";
import PrimaryButton from "./UI/PrimaryButton";
import { useState } from "react";
import { createTask } from "../redux/tasks/asyncThunks";
import { Status } from "../redux/tasks/types";
import { useAppDispatch } from "../redux/hooks";
import { Input } from "./UI/Input";
import { useClickOutside } from "../hooks/useClickOutside";

interface AddNewTaskProps {
  projectId: number;
  parentId?: number;
}

export const AddNewTask = ({ projectId, parentId }: AddNewTaskProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const dispatch = useAppDispatch();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    dispatch(
      createTask({
        title: trimmed,
        description: "",
        status: Status.Todo,
        startDate: null,
        dueDate: null,
        projectId,
        parentId,
      }),
    );
    setNewTaskTitle("");
  };

  const { ref: addTaskRef } = useClickOutside<HTMLDivElement>(
    () => setIsAdding(false),
    isAdding,
  );

  return (
    <div className="mt-2 flex items-center gap-2 py-1" ref={addTaskRef}>
      {isAdding ? (
        <>
          <Input
            id="add-new-task"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubtask();
              if (e.key === "Escape") setIsAdding(false);
            }}
            placeholder={`New ${parentId ? "subtask" : "task"}`}
            className="flex-1"
          />

          <PrimaryButton
            text="Add"
            icon={<Save size={16} />}
            onClick={() => handleAddSubtask()}
            size="xs"
            color="indigo"
          />

          <PrimaryButton
            text="Cancel"
            onClick={() => setIsAdding(false)}
            size="xs"
            color="gray"
            outline
          />
        </>
      ) : (
        <PrimaryButton
          text={`Add new ${parentId ? "subtask" : "task"}`}
          icon={<Plus size={16} />}
          onClick={() => setIsAdding(true)}
          size="xs"
          color="slate"
          outline
          className="my-1.5"
        />
      )}
    </div>
  );
};
