const { prisma } = require("../config");

const roles = [
  {
    name: "REMOVED",
    access: {},
    defaultPath: '/auth/login'
  },
  {
    name: "UNKNOWN",
    access: {},
    defaultPath: '/auth/login'

  },
  {
    name: "Super Admin",
    access: {
      showSuperAdmin: true,
      createSuperAdmin:true,
    },
    defaultPath: '/fo/super-admin/',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Admin",
    access: {
      showAdmin: true,
      createAdmin: true
    },
    defaultPath: '/fo/dashboard',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Room Boy",
    access: {
      showMaid: true,
      createMaid: true
    },
    defaultPath: '/hk/rb/dashboard',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    name: "Mitra",
    access: {
      showMitra: true,
      craeteMitra: true
    },
    defaultPath: '/auth/login'
  },
  {
    name: "Supervisor",
    access: {
      showSupervisor: true,
      createSupervisor: true
    },
    defaultPath: '/hk/spv/dashboard'
  },
  {
    name: "Room",
    access: {
      showInRoom: true,
      createInRoom: true
    },
    defaultPath: '/irs/home'
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