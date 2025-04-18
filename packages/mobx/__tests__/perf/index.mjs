import { fileURLToPath } from "url"
import path from "path"
import { promises as fs } from "fs"
import mkdirp from "mkdirp"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const start = Date.now()
const ver = process.argv[2]
if (!ver || !ver.match(/legacy|proxy/)) {
    throw new Error("specify version to perf test as (legacy|proxy)")
}

export const logger = {
    log: null
}

if (process.env.PERSIST) {
    const logFile = path.resolve(`${__dirname}/../../perf_report/${ver}.txt`)
    mkdirp.sync(path.dirname(logFile))
    // clear previous results
    if (fs.existsSync(logFile)) await fs.unlink(logFile)

    logger.log = function (msg) {
        console.log(msg)
        fs.appendFile(logFile, "\n" + msg, "utf8")
    }
} else {
    logger.log = function (msg) {
        console.log(msg)
    }
}

import("./perf.mjs").then(perf => {
    perf.runForVersion(ver)

    // This test runs last..
    import("tape").then(({ default: tape }) => {
        tape(t => {
            logger.log(
                "\n\nCompleted performance suite in " + (Date.now() - start) / 1000 + " sec."
            )
            t.end()
        })
    })
})
