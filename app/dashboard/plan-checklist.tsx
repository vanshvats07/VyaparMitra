"use client";

import { useState, type FormEvent } from "react";
import {
  planningTasksSchema,
  type PlanningTask,
} from "../../lib/profile-schema";
import type { SupportedLanguage } from "../../lib/profile-options";
import { messages } from "../../lib/translations";

type Props = {
  initialTasks: PlanningTask[];
  language: SupportedLanguage;
};

export default function PlanChecklist({ initialTasks, language }: Props) {
  const copy = messages[language];
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function saveTasks(nextTasks: PlanningTask[]): Promise<boolean> {
    setErrorMessage("");
    const result = planningTasksSchema.safeParse(nextTasks);
    if (!result.success) {
      setErrorMessage(copy.savePlanError);
      return false;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/profiles/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        setErrorMessage(copy.savePlanError);
        return false;
      }

      setTasks(result.data);
      return true;
    } catch {
      setErrorMessage(copy.networkError);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (title.length < 3 || title.length > 160 || tasks.length >= 30) {
      setErrorMessage(copy.savePlanError);
      return;
    }

    const saved = await saveTasks([
      ...tasks,
      { id: crypto.randomUUID(), title, completed: false },
    ]);
    if (saved) {
      setNewTaskTitle("");
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <section
      aria-labelledby="plan-title"
      className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight" id="plan-title">
            {copy.planTitle}
          </h2>
          <p className="mt-2 max-w-2xl leading-7 text-muted">
            {copy.planDescription}
          </p>
        </div>
        <p aria-live="polite" className="rounded-full bg-background px-4 py-2 text-sm font-medium text-brand">
          {copy.planProgress(completedCount, tasks.length)}
        </p>
      </div>

      <ul aria-label={copy.planTitle} className="mt-6 space-y-3">
        {tasks.map((task) => (
          <li
            className="flex items-start gap-3 rounded-xl border border-border p-4"
            key={task.id}
          >
            <input
              aria-label={task.title}
              checked={task.completed}
              className="mt-1 size-5 accent-brand"
              disabled={isSaving}
              onChange={() => {
                void saveTasks(
                  tasks.map((item) =>
                    item.id === task.id
                      ? { ...item, completed: !item.completed }
                      : item,
                  ),
                );
              }}
              type="checkbox"
            />
            <span
              className={`flex-1 leading-7 ${
                task.completed ? "text-muted line-through" : ""
              }`}
            >
              {task.title}
            </span>
            <button
              aria-label={`${copy.removeTask}: ${task.title}`}
              className="rounded-lg px-2 py-1 text-sm text-muted transition-colors hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
              disabled={isSaving}
              onClick={() => {
                void saveTasks(tasks.filter((item) => item.id !== task.id));
              }}
              type="button"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={addTask}>
        <label className="sr-only" htmlFor="new-plan-task">
          {copy.taskPlaceholder}
        </label>
        <input
          className="min-h-12 flex-1 rounded-xl border border-border bg-background px-4 text-base"
          disabled={isSaving || tasks.length >= 30}
          id="new-plan-task"
          maxLength={160}
          minLength={3}
          onChange={(event) => setNewTaskTitle(event.currentTarget.value)}
          placeholder={copy.taskPlaceholder}
          required
          value={newTaskTitle}
        />
        <button
          className="min-h-12 rounded-full bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving || tasks.length >= 30}
          type="submit"
        >
          {isSaving ? copy.savingPlan : copy.addTask}
        </button>
      </form>

      {errorMessage ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
