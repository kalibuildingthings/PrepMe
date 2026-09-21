import { PrepMethod } from "./types";

export const PREP_METHODS: {
  id: PrepMethod;
  name: string;
  letters: { letter: string; label: string }[];
  description: string;
}[] = [
  {
    id: "STAR",
    name: "STAR",
    description: "The classic structure for behavioral answers.",
    letters: [
      { letter: "S", label: "Situation" },
      { letter: "T", label: "Task" },
      { letter: "A", label: "Action" },
      { letter: "R", label: "Result" },
    ],
  },
  {
    id: "STAR-L",
    name: "STAR-L",
    description: "STAR plus the lesson you took away — great for growth-minded roles.",
    letters: [
      { letter: "S", label: "Situation" },
      { letter: "T", label: "Task" },
      { letter: "A", label: "Action" },
      { letter: "R", label: "Result" },
      { letter: "L", label: "Learning" },
    ],
  },
  {
    id: "SOAR",
    name: "SOAR",
    description: "Emphasizes the obstacle you overcame, not just the task.",
    letters: [
      { letter: "S", label: "Situation" },
      { letter: "O", label: "Obstacle" },
      { letter: "A", label: "Action" },
      { letter: "R", label: "Result" },
    ],
  },
  {
    id: "DIGS",
    name: "DIGS",
    description: "A leaner format for concise, high-signal storytelling.",
    letters: [
      { letter: "D", label: "Detail" },
      { letter: "I", label: "Impact" },
      { letter: "G", label: "Growth" },
      { letter: "S", label: "Summary" },
    ],
  },
];
