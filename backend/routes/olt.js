import { Client } from "ssh2";

export default async function oltRoutes(fastify, options) {
  fastify.get("/", async (req, reply) => {
    return { message: "OLT API is running" };
  });

  fastify.get("/get_olt_names", async (req, reply) => {
    const oltData = await fastify.db.all(
      'SELECT id, name FROM olt_data WHERE name IS NOT NULL AND name != "" ORDER BY name'
    );
    return { olt_data: oltData };
  });

  fastify.post("/configure_vlan", async (req, reply) => {
    const { olt_option: olt_name, olt_id, vlan } = req.body;
    
    // Query database for router IP and eth_trunks
    let results;
    if (olt_id) {
      // Use ID if provided
      results = await fastify.db.all(
        'SELECT router_ip, eth_trunk FROM olt_data WHERE id = ?',
        [olt_id]
      );
    } else {
      // Fallback to name for backward compatibility
      results = await fastify.db.all(
        'SELECT router_ip, eth_trunk FROM olt_data WHERE name = ?',
        [olt_name]
      );
    }
    
    if (!results || results.length === 0) {
      return reply.code(400).send({ message: "OLT not found!" });
    }
    
    // Get unique router IP and all eth_trunks
    const router_ip = results[0].router_ip;
    const eth_trunks = results.map(row => row.eth_trunk);

    const router = {
      device_type: "huawei_vrp",
      host: router_ip,
      username: "nyamdorj",
      password: "Up!@#03220211",
    };
    const commands = [`vlan batch ${vlan}`];
    for (const eth_trunk of eth_trunks) {
      commands.push(`interface ${eth_trunk}`);
      commands.push(`port trunk allow-pass vlan ${vlan}`);
    }
    console.log(commands);
    try {
      const output = await executeSSH(router, commands);
      console.log(output)
      return reply.code(200).send({
        message: `VLAN ${vlan} added to ${eth_trunks} on ${router_ip}`,
        output,
      });
    } catch (err) {
      console.log(err)
      return reply
        .code(500)
        .send({ message: "Error configuring VLAN", error: err.message });
    }
  });
}

// helper function
function executeSSHOLD(router, commands) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = "";
    conn
      .on("ready", () => {
        conn.shell((err, stream) => {
          if (err) return reject(err);
          stream
            .on("close", () => {
              conn.end();
              resolve(output);
            })
            .on("data", (data) => {
              output += data.toString();
            });

          // Send commands sequentially
          for (const cmd of commands) {
            stream.write(cmd + "\n");
          }
          stream.end("save\n");
        });
      })
      .on("error", reject)
      .connect(router);
  });
}


export async function executeSSH(router, commands) {
  const conn = new Client();

  const connectionConfig = {
    host: router.host,
    port: 22,
    username: router.username,
    password: router.password,
    readyTimeout: 10000, // optional: 10s timeout for connection
  };

  return new Promise((resolve, reject) => {
    let allOutput = "";

    conn
      .on("ready", async () => {
        try {
          for (const cmd of commands) {
            const result = await execCommand(conn, cmd);
            allOutput += `\n> ${cmd}\n${result}\n`;
          }
          conn.end();
          resolve(allOutput.trim());
        } catch (err) {
          conn.end();
          reject(err);
        }
      })
      .on("error", reject)
      .connect(connectionConfig);
  });
}

function execCommand(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);

      let output = "";
      stream
        .on("close", () => resolve(output))
        .on("data", (data) => (output += data.toString()))
        .stderr.on("data", (data) => (output += data.toString()));
    });
  });
}
