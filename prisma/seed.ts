import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const pieces = [
	{
		name: "Dusk Bowl",
		collection: "Everyday",
		glaze: "matte",
		color: "terracotta",
		type: "bowl",
		description:
			"A wide, shallow bowl with a warm terracotta finish. Earthy and understated, perfect for everyday use.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776490634/ChatGPT_Image_Apr_18_2026_12_36_59_AM_k3j3yk.png",
	},
	{
		name: "Morning Mug",
		collection: "Everyday",
		glaze: "glossy",
		color: "cream",
		type: "mug",
		description:
			"A classic cylindrical mug with a smooth cream glaze. Holds 12oz and feels solid in the hand.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776490707/ChatGPT_Image_Apr_18_2026_12_38_18_AM_efwjhc.png",
	},
	{
		name: "Slate Vase",
		collection: "Statement",
		glaze: "matte",
		color: "slate",
		type: "vase",
		description:
			"A tall, narrow vase in deep slate grey. Clean lines make it a striking centerpiece for dried or fresh flowers.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776490732/ChatGPT_Image_Apr_18_2026_12_38_47_AM_ol6lyd.png",
	},
	{
		name: "Ember Plate",
		collection: "Everyday",
		glaze: "glossy",
		color: "rust",
		type: "plate",
		description:
			"A wide dinner plate with a deep rust glaze that shifts in color under different lights.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776490759/ChatGPT_Image_Apr_18_2026_12_39_12_AM_pkj58g.png",
	},
	{
		name: "Fog Pitcher",
		collection: "Seasonal",
		glaze: "matte",
		color: "grey",
		type: "pitcher",
		description:
			"A small pour-over pitcher with a soft grey matte finish. Minimal spout, comfortable handle.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776490773/ChatGPT_Image_Apr_18_2026_12_39_27_AM_edtys0.png",
	},
	{
		name: "Moss Planter",
		collection: "Statement",
		glaze: "textured",
		color: "moss green",
		type: "planter",
		description:
			"A squat, wide planter with a textured exterior that mimics bark. Drainage hole included.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776490828/ChatGPT_Image_Apr_18_2026_12_40_21_AM_haeohi.png",
	},
	{
		name: "Tide Bowl",
		collection: "Seasonal",
		glaze: "glossy",
		color: "ocean blue",
		type: "bowl",
		description:
			"A deep bowl with a layered blue glaze that pools darker at the base, like water at depth.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776490849/ChatGPT_Image_Apr_18_2026_12_40_45_AM_blsbkx.png",
	},
	{
		name: "Linen Mug",
		collection: "Everyday",
		glaze: "matte",
		color: "off-white",
		type: "mug",
		description:
			"A slightly tapered mug with a linen-toned matte glaze. Simple and honest in form.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776490874/ChatGPT_Image_Apr_18_2026_12_41_08_AM_ekkkgq.png",
	},
	{
		name: "Copper Vase",
		collection: "Limited Edition",
		glaze: "glossy",
		color: "copper",
		type: "vase",
		description:
			"A short, wide-mouthed vase with a rich copper glaze. Part of a small run of metallic glazes.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776490991/ChatGPT_Image_Apr_18_2026_12_42_56_AM_gywyn5.png",
	},
	{
		name: "Sand Plate",
		collection: "Everyday",
		glaze: "matte",
		color: "sand",
		type: "plate",
		description:
			"A side plate in a warm sand tone. Pairs well with bolder pieces or stands alone as a calm presence.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776491002/ChatGPT_Image_Apr_18_2026_12_43_13_AM_nsn8ol.png",
	},
	{
		name: "Pebble Cup",
		collection: "Everyday",
		glaze: "textured",
		color: "stone",
		type: "cup",
		description:
			"A handleless cup with a pebble-smooth textured glaze. Good for espresso or small pours.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776491067/ChatGPT_Image_Apr_18_2026_12_44_22_AM_tyyts4.png",
	},
	{
		name: "Charcoal Serving Bowl",
		collection: "Statement",
		glaze: "matte",
		color: "charcoal",
		type: "bowl",
		description:
			"A large, deep serving bowl in dark charcoal. Bold enough to anchor a table setting.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776491128/ChatGPT_Image_Apr_18_2026_12_45_23_AM_mhcvac.png",
	},
	{
		name: "Blush Vase",
		collection: "Seasonal",
		glaze: "glossy",
		color: "blush",
		type: "vase",
		description:
			"A tall vase with a soft blush glaze that deepens toward the base. Elegant and delicate.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776491171/ChatGPT_Image_Apr_18_2026_12_45_57_AM_jdxrjd.png",
	},
	{
		name: "Iron Pitcher",
		collection: "Limited Edition",
		glaze: "textured",
		color: "dark brown",
		type: "pitcher",
		description:
			"A sturdy pitcher with a rough iron-toned glaze. Feels like it belongs on a farmhouse table.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776491218/ChatGPT_Image_Apr_18_2026_12_46_50_AM_dtbbx4.png",
	},
	{
		name: "Sage Planter",
		collection: "Everyday",
		glaze: "matte",
		color: "sage",
		type: "planter",
		description:
			"A medium planter in a muted sage green. Subtle enough to let the plant do the talking.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776491242/ChatGPT_Image_Apr_18_2026_12_47_16_AM_q8mn7w.png",
	},
	{
		name: "Ash Bowl",
		collection: "Limited Edition",
		glaze: "textured",
		color: "ash white",
		type: "bowl",
		description:
			"A wide bowl with a raw, ash-toned finish. The texture makes each piece slightly unique.",
		photoUrl: "https://res.cloudinary.com/deusi5if4/image/upload/v1776491268/ChatGPT_Image_Apr_18_2026_12_47_40_AM_hbdqvf.png",
	},
];

async function main() {
	console.log("Seeding pieces...");
	await prisma.piece.createMany({ data: pieces, skipDuplicates: true });
	console.log(`Seeded ${pieces.length} pieces.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});