import archiver from "archiver"

import path from "path"

import fs from "fs-extra"

import isGlob from "is-glob"

import isBuffer from "is-buffer"

import isStream from "is-stream"

import Promise from "bluebird"

export class Nemi {

    public readonly archive: archiver.Archiver

    constructor(filename: string) {
        const ext = path.extname(filename).slice(1)
        const output = fs.createWriteStream(filename)
        const archive = archiver((ext as archiver.Format), {
            zlib: { level: 9 },
        })
        archive.pipe(output)
        this.archive = archive
    }

    public add(src: string, dest: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (isStream.readable(src) || isBuffer(src)) {
                // Readable stream, string or buffer
                this.archive.append(src, { name: dest })
                resolve()
            }
            else if (isGlob(src)) {
                // Glob
                this.archive.glob(src)
                resolve()
            }
            else fs.pathExists(src)
                .then((exists) => {
                    if (exists) fs.lstat(src).then((stats) => {
                        if (stats == null) reject(new ReferenceError("Unable to get stats."))
                        else {
                            if (stats.isFile()) this.archive.file(src, { name: dest || src })
                            else this.archive.directory(src, dest === "*" ? false : dest || src)
                            resolve()
                        }
                    })
                    else {
                        // String
                        this.archive.append(src, { name: dest })
                        resolve()
                    }
                })
                .catch(reject)
        })
    }

    public on(event: string, cb: Function): void {
        this.archive.on(event, (...data) => cb(...data))
    }

    public close(cb?: Function): void {
        if (cb) this.on("close", (...data: any) => cb(...data))
        else this.archive.finalize()
    }

}