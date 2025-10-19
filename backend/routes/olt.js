import { readFileSync } from "fs";
import { join } from "path";
import { Client } from "ssh2";

const OLT_MAPPING = JSON.parse(
  readFileSync(join(process.cwd(), "./utils/olt_data.json"), "utf-8")
);

export default async function oltRoutes(fastify, options) {
  fastify.get("/", async (req, reply) => {
    return { message: "OLT API is running" };
  });

  fastify.get("/get_olt_names", async (req, reply) => {
    const oltNames = new Set();
    for (const details of Object.values(OLT_MAPPING)) {
      for (const olt of Object.values(details["Eth-Trunks"])) {
        if (olt) oltNames.add(olt);
      }
    }
    return { olt_names: Array.from(oltNames).sort() };
  });

  fastify.post("/configure_vlan", async (req, reply) => {
    const { olt_option: olt_name, vlan } = req.body;
    let router_ip = null;
    const eth_trunks = [];

    for (const [ip, details] of Object.entries(OLT_MAPPING)) {
      for (const [eth_trunk, olt] of Object.entries(details["Eth-Trunks"])) {
        if (olt_name === olt) {
          console.log(ip)
          router_ip = ip;
          eth_trunks.push(eth_trunk);
        }
      }
    }
    if (!router_ip) {
      return reply.code(400).send({ message: "OLT not found!" });
    }

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
      // const output = await executeSSH(router, commands);
      return reply.code(200).send({
        message: `VLAN ${vlan} added to ${eth_trunks} on ${router_ip}`,
        // output,
      });
    } catch (err) {
      return reply
        .code(500)
        .send({ message: "Error configuring VLAN", error: err.message });
    }
  });
}

// helper function
function executeSSH(router, commands) {
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
