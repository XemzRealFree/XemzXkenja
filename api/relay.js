export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, plan } = req.body;

  const planSpecs = {
    "1gb": { ram: 1000, disk: 1000, cpu: 40 },
    "2gb": { ram: 2000, disk: 2000, cpu: 60 },
    "3gb": { ram: 3000, disk: 3000, cpu: 80 },
    "4gb": { ram: 4000, disk: 4000, cpu: 100 },
    "unlimited": { ram: 0, disk: 0, cpu: 0 }
  };

  const specs = planSpecs[plan];
  if (!specs) {
    return res.status(400).json({ error: "Invalid plan selected." });
  }

  const DOMAIN = process.env.DOMAIN || "https://kenja-ganteng.kenjaapublik.my.id";
  const APIKEY = process.env.APIKEY || "ptla_RKC13A19K8mEKJrJidUtlKyFZrkh1dkTqCGymPvxM5Z";

  try {
    // ✅ CREATE USER
    const userRes = await fetch(`${DOMAIN}/api/application/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APIKEY}`
      },
      body: JSON.stringify({
        email: `${username}@gmail.com`,
        username,
        first_name: username,
        last_name: 'Server',
        password: `${username}1234`
      }),
    });

    const userData = await userRes.json();
    if (userData.errors) {
      return res.status(500).json({ error: userData.errors });
    }

    const usr_id = userData.attributes.id;

    // ✅ CREATE SERVER
    const serverRes = await fetch(`${DOMAIN}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APIKEY}`
      },
      body: JSON.stringify({
        name: `${username} Server`,
        description: `Auto panel by XemZ`,
        user: usr_id,
        egg: 15,
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: "npm start",
        environment: {
          CMD_RUN: "npm start"
        },
        limits: {
          memory: specs.ram,
          disk: specs.disk,
          cpu: specs.cpu,
          io: 500,
          swap: 0
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 5
        },
        deploy: {
          locations: [1],
          dedicated_ip: false,
          port_range: []
        }
      }),
    });

    const serverData = await serverRes.json();

    if (serverData.errors) {
      return res.status(500).json({ error: serverData.errors });
    }

    // ✅ Balikin hasil yang udah DIPETAKAN
    return res.status(200).json({
      username: userData.attributes.username,
      password: `${username}1234`,
      domain: DOMAIN,
      server_name: serverData.attributes.name,
      ram: specs.ram === 0 ? "Unlimited" : `${specs.ram} MB`,
      disk: specs.disk === 0 ? "Unlimited" : `${specs.disk} MB`,
      cpu: specs.cpu === 0 ? "Unlimited" : `${specs.cpu}%`,
      created: new Date().toLocaleString('id-ID')
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
