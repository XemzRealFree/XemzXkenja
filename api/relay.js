export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, plan } = req.body;

  if (!username || !plan) {
    return res.status(400).json({ error: 'Missing username or plan' });
  }

  const planSpecs = {
    "1gb": { ram: 1000, disk: 1000, cpu: 40 },
    "2gb": { ram: 2000, disk: 2000, cpu: 60 },
    "unlimited": { ram: 0, disk: 0, cpu: 0 },
  };

  const specs = planSpecs[plan];
  if (!specs) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  // ✅ V2 CONFIG
  const PTERO_DOMAIN = "https://kenja-ganteng.kenjaapublik.my.id"; // Ganti domain kamu
  const API_KEY = "ptla_RKC13A19K8mEKJrJidUtlKyFZrkh1dkTqCGymPvxM5Z";  // API Key kamu
  const USER_ID = 1;  // User ID di Ptero
  const eggV2 = "15";  // Egg ID
  const nestidV2 = "5";  // Nest ID
  const locV2 = "1";   // Location ID
  const ALLOCATION_ID = 1; // Allocation ID

  const payload = {
    name: username,
    user: USER_ID,
    egg: eggV2,
    nest: nestidV2,
    docker_image: "ghcr.io/pterodactyl/yolks:nodejs_18", // contoh Node.js Yolk
    startup: "npm run start", // contoh startup script
    environment: {
      // ENV bisa beda sesuai egg
      NODE_VERSION: "18",
      AUTO_UPDATE: "1",
    },
    limits: {
      memory: specs.ram,
      swap: 0,
      disk: specs.disk,
      io: 500,
      cpu: specs.cpu
    },
    feature_limits: {
      databases: 1,
      allocations: 1
    },
    allocation: {
      default: ALLOCATION_ID
    },
    deploy: {
      locations: [locV2],
      dedicated_ip: false,
      port_range: []
    }
  };

  try {
    const response = await fetch(`${PTERO_DOMAIN}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Ptero API Error:", data);
      return res.status(500).json({ error: 'Failed to create server', detail: data });
    }

    return res.status(200).json({
      username: data.attributes.name || username,
      password: `${username}1234`,
      domain: "xemz.my.id",
      ram: specs.ram === 0 ? "Unlimited" : `${specs.ram} MB`,
      disk: specs.disk === 0 ? "Unlimited" : `${specs.disk} MB`,
      cpu: specs.cpu === 0 ? "Unlimited" : `${specs.cpu}%`,
      created: new Date().toLocaleString('id-ID')
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
      }
