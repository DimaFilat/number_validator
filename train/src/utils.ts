function* iterator(buffer: Buffer, cb: Function) {
  let count: number = 0
  while(count !== buffer.length) {
    yield cb(buffer[count])
  }
}