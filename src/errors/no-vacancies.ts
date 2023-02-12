import { ApplicationError } from "@/protocols";

export function noVacanciesError(): ApplicationError {
  return {
    name: "noVacanciesError",
    message: "No vacancies available",
  };
}
