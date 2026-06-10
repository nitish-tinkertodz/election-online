import { queryFirst } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";

export async function getStudentEligibility(studentId: string) {
  if (!getBindings().DB) {
    return null;
  }

  return queryFirst<{
    id: string;
    class_id: string;
    division_id: string | null;
  }>(
    getBindings(),
    `SELECT id, class_id, division_id
     FROM students
     WHERE id = ?;`,
    [studentId]
  );
}

export async function isEligibleForElection(params: {
  studentClassId?: string | null;
  studentDivisionId?: string | null;
  electionClassId?: string | null;
  electionDivisionId?: string | null;
}) {
  const { studentClassId, studentDivisionId, electionClassId, electionDivisionId } = params;

  if (!electionClassId || !studentClassId) {
    return false;
  }

  if (studentClassId !== electionClassId) {
    return false;
  }

  if (electionDivisionId && studentDivisionId !== electionDivisionId) {
    return false;
  }

  return true;
}
