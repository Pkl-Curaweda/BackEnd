const { prisma } = require("../config");

const roles = [
  {
    name: "REMOVED",
    access: {},
  },
  {
    name: "Super Admin",
    access: {
      showSuperAdmin: true,
      createSuperAdmin:true,
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Admin",
    access: {
      showAdmin: true,
      createAdmin: true
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Room Boy",
    access: {
      showMaid: true,
      createMaid: true
    },
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Mitra",
    access: {}
  },
  {
    name: "Supervisor",
    access: {
      showSupervisor: true,
      createSupervisor: true
    },
  },
  {
    name: "Room",
    access: {}
  }
];

async function roleSeed() {
  for (let role of roles) {
    await prisma.role.create({
      data: role,
    });
  }
}

module.exports = { roleSeed };
;