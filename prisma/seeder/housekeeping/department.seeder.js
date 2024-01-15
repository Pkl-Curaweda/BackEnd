const { prisma } = require("../config");

const departments = [
  {
    shortDesc: 'ENG',
    longDesc: "Enginering"
  },
  {
    shortDesc: 'HK',
    longDesc: "House Keeping"
  },
];

async function departmentSeed() {
  for (let department of departments) {
    await prisma.department.create({
      data: department,
    });
  }
}

module.exports = { departmentSeed };
