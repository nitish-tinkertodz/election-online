import type { D1Bindings, D1Value } from "@/lib/db/types";

export function getDatabase(bindings?: D1Bindings) {
  const database = bindings?.DB;

  if (!database) {
    throw new Error("D1 binding `DB` is not configured.");
  }

  return database;
}

export async function queryAll<T>(
  bindings: D1Bindings | undefined,
  sql: string,
  values: D1Value[] = []
) {
  const statement = getDatabase(bindings).prepare(sql);
  const runner = values.length > 0 ? statement.bind(...values) : statement;
  const response = await runner.all<T>();

  return response.results;
}

export async function queryFirst<T>(
  bindings: D1Bindings | undefined,
  sql: string,
  values: D1Value[] = []
) {
  const statement = getDatabase(bindings).prepare(sql);
  const runner = values.length > 0 ? statement.bind(...values) : statement;

  return runner.first<T>();
}

export async function execute(
  bindings: D1Bindings | undefined,
  sql: string,
  values: D1Value[] = []
) {
  const statement = getDatabase(bindings).prepare(sql);
  const runner = values.length > 0 ? statement.bind(...values) : statement;

  return runner.run();
}
