const { prisma } = require("../config");

const maidTasks = [
  {
    roomId: 101,
    request: "Please clean, there's a coffee on the celling",
    schedule: '08:40-08:55',
    roomMaidId: 1,
    typeId: "FCLN-DLX"
  },
];

async function maidTaskSeed() {
    for (let maidTask of maidTasks) {
      await prisma.maidTask.create({
        data: maidTask,
      });
    }
  }

  module.exports = { maidTaskSeed };
