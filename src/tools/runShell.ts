import { exec, execSync } from "node:child_process";
import { ToolDefinition } from "./base";
import iconv from "iconv-lite";

const SHELL_TIMEOUT_MS = 8000;
const SHELL_MAX_BUFFER = 512 * 1024;

function detectWindowsEncoding(): string {
    try {
        const chcpOut = execSync("chcp", { encoding: "utf8", windowsHide: true });
        const codePage = chcpOut.match(/:\s*(\d+)/)?.[1] ?? "857";
        switch (codePage) {
            case "857": return "cp857";
            case "850": return "cp850";
            case "866": return "cp866";
            case "1254": return "windows-1254";
            case "65001": return "utf8";
            default: return "cp857";
        }
    } catch {
        return "cp857";
    }
}

function decodeOutput(
    value: string | Buffer | null | undefined,
    encoding: string
): string {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    try {
        return iconv.decode(value, encoding).trim();
    } catch {
        try {
            return value.toString("utf8").trim();
        } catch {
            return "";
        }
    }
}

export const runShellTool: ToolDefinition = {
    name: "run_shell",
    description: "Çalışma alanında shell komutu çalıştırır.",
    permissionTag: "shell",
    inputSchema: {
        command: "string"
    },

    async execute(args, context) {
        const command = args.command;

        if (typeof command !== "string" || command.trim() === "") {
            throw new Error("run_shell için geçerli bir command gerekli.");
        }

        const encoding = detectWindowsEncoding();

        return await new Promise<string>((resolve, reject) => {
            exec(
                command,
                {
                    cwd: context.workspaceRoot,
                    windowsHide: true,
                    timeout: SHELL_TIMEOUT_MS,
                    maxBuffer: SHELL_MAX_BUFFER,
                    encoding: "buffer"
                },
                (error, stdout, stderr) => {
                    const out = decodeOutput(stdout, encoding);
                    const err = decodeOutput(stderr, encoding);

                    if (error) {
                        const killed = "killed" in error && Boolean(error.killed);
                        const signal = "signal" in error ? error.signal : undefined;

                        if (killed || signal === "SIGTERM") {
                            return reject(
                                new Error(`Shell komutu zaman aşımına uğradı (${SHELL_TIMEOUT_MS}ms).`)
                            );
                        }

                        if (out && err) return reject(new Error(`STDOUT:\n${out}\n\nSTDERR:\n${err}`));
                        if (err) return reject(new Error(err));
                        if (out) return reject(new Error(out));

                        return reject(new Error(error.message || "Shell komutu başarısız oldu."));
                    }

                    if (out && err) return resolve(`STDOUT:\n${out}\n\nSTDERR:\n${err}`);
                    if (out) return resolve(out);
                    if (err) return resolve(`STDERR:\n${err}`);

                    return resolve("Komut çalıştı, çıktı dönmedi.");
                }
            );
        });
    }
};