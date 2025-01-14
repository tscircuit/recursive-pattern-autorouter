import "bun-match-svg";

import type { SimpleRouteJson } from "../../lib/types/SimpleRouteJson";
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
import * as fs from "node:fs";
import * as path from "node:path";
import looksSame from "looks-same";
import { it, expect, type CustomMatcher, type MatcherResult } from "bun:test";

function simpleRouteToCircuitJson(simpleRoute: SimpleRouteJson) {}

expect.extend({
	async toMatchSimpleRouteSnapshot(
		this: any,
		received: unknown,
		...args: any[]
	): Promise<MatcherResult> {
		const [testPath] = args;
		const circuitJson = simpleRouteToCircuitJson(received as any);
		const svg = convertCircuitJsonToPcbSvg(circuitJson as any);

		const snapshotDir = path.join(path.dirname(testPath), "__snapshots__");
		const snapshotName = `${path.basename(testPath)}-simpleroute.snap.svg`;
		const filePath = path.join(snapshotDir, snapshotName);

		if (!fs.existsSync(snapshotDir)) {
			fs.mkdirSync(snapshotDir, { recursive: true });
		}

		const updateSnapshot =
			process.argv.includes("--update-snapshots") ||
			process.argv.includes("-u") ||
			Boolean(process.env.BUN_UPDATE_SNAPSHOTS);

		if (!fs.existsSync(filePath) || updateSnapshot) {
			console.log("Creating snapshot at", filePath);
			fs.writeFileSync(filePath, svg);
			return {
				message: () => `Snapshot created at ${filePath}`,
				pass: true,
			};
		}

		const existingSnapshot = fs.readFileSync(filePath, "utf-8");

		const result = await looksSame(
			Buffer.from(svg),
			Buffer.from(existingSnapshot),
			{
				strict: false,
				tolerance: 2,
			},
		);

		if (result.equal) {
			return {
				message: () => "Snapshot matches",
				pass: true,
			};
		}

		const diffPath = filePath.replace(".snap.svg", ".diff.png");
		await looksSame.createDiff({
			reference: Buffer.from(existingSnapshot),
			current: Buffer.from(svg),
			diff: diffPath,
			highlightColor: "#ff00ff",
		});

		return {
			message: () => `Snapshot does not match. Diff saved at ${diffPath}`,
			pass: false,
		};
	},
});

declare module "bun:test" {
	interface Matchers<T = unknown> {
		toMatchSimpleRouteSnapshot(testPath: string): Promise<MatcherResult>;
	}
}
