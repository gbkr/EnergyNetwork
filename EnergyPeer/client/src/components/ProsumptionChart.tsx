import { types } from "energylib";
import Chart from "react-apexcharts";
import React from "react";

const ProsumptionChart = ({
  prosumption,
}: {
  prosumption: types.EnergyProsumption[];
}) => {
  const [dataList, setDataList] = React.useState<types.EnergyProsumption[]>([]);

  React.useEffect(() => {
    setDataList([...dataList, prosumption[0]]);
  }, [prosumption, dataList]);

  const options: any = {
    chart: {
      id: "prosumption",
      zoom: {
        enabled: false,
      },
      animations: {
        easing: "linear",
        dynamicAnimation: {
          speed: 500,
        },
      },
    },

    xaxis: {
      range: 100,
      labels: {
        formatter: (_: any) => "",
      },
    },
    yaxis: {
      labels: {
        formatter: (val: any) => val.toFixed(0),
        showDuplicates: false,
      },
      title: { text: "Energy usage" },
    },
  };

  const series = [
    {
      name: "Consumption",
      data: dataList.map((hour) => {
        return { x: hour.hour, y: hour.consumption };
      }),
    },

    {
      name: "Production",
      data: dataList.map((hour) => {
        return { x: hour.hour, y: hour.production };
      }),
    },

    {
      name: "Net",
      data: dataList.map((hour) => {
        return { x: hour.hour, y: hour.net };
      }),
    },
  ];

  return <Chart options={options} series={series} type="line" />;
};

export default ProsumptionChart;
