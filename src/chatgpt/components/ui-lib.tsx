import styles from "./ui-lib.module.scss";
import React from "react";
import { CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { Prompt } from "../store/prompt";

export function Popover(props: {
  children: JSX.Element;
  content: JSX.Element;
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className={styles.popover}>
      {props.children}
      {props.open && (
        <div className={styles["popover-content"]}>
          <div className={styles["popover-mask"]} onClick={props.onClose}></div>
          {props.content}
        </div>
      )}
    </div>
  );
}

export function Card(props: { children: JSX.Element[]; className?: string }) {
  return (
    <div className={styles.card + " " + props.className}>{props.children}</div>
  );
}

export function ListItem(props: { children: JSX.Element[] }) {
  if (props.children.length > 2) {
    throw Error("Only Support Two Children");
  }

  return <div className={styles["list-item"]}>{props.children}</div>;
}

export function List(props: { children: JSX.Element[] | JSX.Element }) {
  return <div className={styles.list}>{props.children}</div>;
}

export function Loading() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </div>
  );
}

export function PromptHints(props: { prompts: Prompt[]; onPromptSelect: (prompt: Prompt) => void }) {
  if (props.prompts.length === 0) return null;

  return (
    <div className={styles['prompt-hints']}>
      {props.prompts.map((prompt, i) => (
        <div
          className={styles['prompt-hint']}
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
        >
          <div className={styles['hint-title']}>{prompt.title}</div>
          <div className={styles['hint-content']}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}

export const Emoji = dynamic(async () => (await import('emoji-picker-react')).Emoji, {
  loading: () => <CircularProgress />,
});
