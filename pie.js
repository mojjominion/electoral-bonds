import { createCanvas, loadImage } from "canvas";
import { writeFileSync } from "fs";
import { readJsonFile } from "./json.js";

import { formatter } from "./util.js";

function generateDistinctRandomColors(count) {
  const colors = [];
  const minDistance = 50; // Minimum distance between colors in RGB space

  for (let i = 0; i < count; i++) {
    let color;
    do {
      color = [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
      ];
    } while (
      colors.some(
        (prevColor) => calculateDistance(prevColor, color) < minDistance,
      )
    );

    colors.push(color);
  }

  return colors.map((color) => `rgb(${color.join(",")})`);
}

function calculateDistance(color1, color2) {
  const squaredDistance = color1.reduce((sum, value, index) => {
    return sum + Math.pow(value - color2[index], 2);
  }, 0);
  return Math.sqrt(squaredDistance);
}

async function createChart() {
  const donnerWise = await readJsonFile("./out/donner_wise.json");
  donnerWise.sort((a, b) => -a.totalAmount + b.totalAmount);
  const index = 5;
  const sliced = donnerWise.slice(0, index);
  const remaining = donnerWise
    .slice(index)
    .reduce((a, x) => a + x.totalAmount, 0);

  const colors = generateDistinctRandomColors(index + 1);

  const donner_data = [
    ...sliced,
    {
      donner: "Remaining",
      totalAmount: remaining,
      totalAmountString: formatter.format(remaining),
    },
  ].map((x, i) => ({
    label: `${x.donner} [${x.totalAmountString}]`,
    value: x.totalAmount,
    color: colors[i],
  }));

  // Generate pie chart
  const width = 800;
  const height = 1300 * (index / 10);
  const legendWidth = 2000; // Define legend width
  // Generate pie chart with legends
  const pieChartWithLegendsImage = createPieChartWithLegends(
    donner_data,
    width,
    height,
    legendWidth, // Pass legend width
  );

  // Save pie chart with legends image to file
  writeFileSync("pieChart.png", pieChartWithLegendsImage);
  console.log("Pie chart with legends image created successfully.");
}
createChart();

function createPieChartWithLegends(data, width, height, legendWidth) {
  // Calculate legend font size
  const legendFontSize = Math.min(width, height) * 0.05;

  // Create canvas for the pie chart
  const pieChartCanvas = createCanvas(width, height);
  const pieChartCtx = pieChartCanvas.getContext("2d");

  // Create canvas for legends
  const legendsCanvas = createCanvas(legendWidth, height);
  const legendsCtx = legendsCanvas.getContext("2d");

  // Draw pie chart slices
  drawPieChart(data, width, height, pieChartCtx);

  // Draw legends
  drawLegends(data, legendFontSize, legendsCtx);

  // Determine the combined width
  const combinedWidth = width + legendWidth + 20;

  // Create canvas for the combined image
  const combinedCanvas = createCanvas(combinedWidth, height);
  const combinedCtx = combinedCanvas.getContext("2d");

  // Draw pie chart on the combined canvas
  combinedCtx.drawImage(pieChartCanvas, 0, 0);
  // Draw legends on the combined canvas
  combinedCtx.drawImage(legendsCanvas, width + 20, 0);

  return combinedCanvas.toBuffer();
}

// Function to draw pie chart slices
function drawPieChart(data, width, height, ctx) {
  // Calculate total value
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  // Set starting angle for each slice
  let startAngle = -Math.PI / 2;

  // Draw pie chart slices
  data.forEach((slice) => {
    const angle = (slice.value / totalValue) * (Math.PI * 2);

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.arc(
      width / 2,
      height / 2,
      Math.min(width, height) / 2,
      startAngle,
      startAngle + angle,
    );
    ctx.fillStyle = slice.color;
    ctx.fill();

    // Update start angle for next slice
    startAngle += angle;
  });
}

// Function to draw legends
function drawLegends(data, legendFontSize, ctx) {
  data.forEach((slice, index) => {
    const legendX = 10;
    const legendY = index * (legendFontSize * 1.5) + 200;

    ctx.fillStyle = slice.color;
    ctx.fillRect(
      legendX,
      legendY - legendFontSize * 0.8,
      legendFontSize * 1.2,
      legendFontSize * 1.2,
    );

    ctx.fillStyle = "#000";
    ctx.font = `${legendFontSize}px YourFontName`; // Change YourFontName to the font family you want to use
    ctx.fillText(slice.label, legendX + legendFontSize * 1.5, legendY);
  });
}
