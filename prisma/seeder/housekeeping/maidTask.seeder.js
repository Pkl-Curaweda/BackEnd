const { prisma } = require("../config");

const maidTasks = [
  {
    roomId: 1,
    request: "Please clean, there's a coffee on the celling",
    roomMaidId: 1,
    typeId: 1
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
