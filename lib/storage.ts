import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoEvaluation } from "./scoring";
import { defaultProfile, marketList } from "./snapshot";
import type { Evaluation, ScoringProfile } from "./types";

const dataDir = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.DATA_DIR || ".data");

async function readJson<T>(name: string, fallback: T): Promise<T> {
  await mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await readFile(path.join(/* turbopackIgnore: true */ dataDir, name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(name: string, value: T) {
  await mkdir(dataDir, { recursive: true });
  const target = path.join(/* turbopackIgnore: true */ dataDir, name);
  const temp = `${target}.tmp`;
  await writeFile(temp, JSON.stringify(value, null, 2), "utf8");
  await rename(temp, target);
}

export async function listEvaluations() {
  const rows = await readJson<Evaluation[]>("evaluations.json", []);
  return rows.length ? rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [demoEvaluation()];
}

export async function getEvaluation(id: string) {
  return (await listEvaluations()).find((row) => row.id === id) ?? null;
}

export async function saveEvaluation(evaluation: Evaluation) {
  const rows = await readJson<Evaluation[]>("evaluations.json", []);
  const index = rows.findIndex((row) => row.id === evaluation.id);
  if (index >= 0) rows[index] = evaluation;
  else rows.unshift(evaluation);
  await writeJson("evaluations.json", rows);
  return evaluation;
}

export async function listProfiles() {
  const stored = await readJson<ScoringProfile[]>("profiles.json", []);
  return marketList.map((market) => stored.find((p) => p.market === market.code) ?? defaultProfile(market.code));
}

export async function getProfile(market: string) {
  return (await listProfiles()).find((profile) => profile.market === market) ?? defaultProfile(market);
}

export async function saveProfile(profile: ScoringProfile) {
  const rows = await readJson<ScoringProfile[]>("profiles.json", []);
  const index = rows.findIndex((row) => row.market === profile.market);
  if (index >= 0) rows[index] = profile;
  else rows.push(profile);
  await writeJson("profiles.json", rows);
  return profile;
}
