import { useState } from "react";
import DefaultLayout from "@/layouts/default";
import {
  Search,
  PlayCircle,
  BrainCircuit,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import {
  Button,
  Card,
  Image,
  Input,
  Progress,
  Tooltip,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Spacer,
  Divider,
  CardHeader,
} from "@heroui/react";
import axios from "axios";
//import { post } from "@/utils/api";

const activity_names = {
  0: "Other",
  1: "Lying",
  2: "Sitting",
  3: "Standing",
  4: "Walking",
  5: "Running",
  6: "Cycling",
  7: "Nordic walking",
  9: "Watching TV",
  10: "Computer work",
  11: "Car driving",
  12: "Ascending stairs",
  13: "Descending stairs",
  16: "Vacuum cleaning",
  17: "Ironing",
  18: "Folding laundry",
  19: "House cleaning",
  20: "Playing soccer",
  24: "Rope jumping",
};

const activity_pictures = {
  0: "/activities/other.jpg",
  1: "/activities/laying.jpg",
  2: "/activities/sitting.jpg",
  3: "/activities/standing.jpg",
  4: "/activities/walking.jpg",
  5: "/activities/running.jpeg",
  6: "/activities/cycling.jpeg",
  7: "/activities/nordic_walking.jpg",
  9: "/activities/watching_tv.jpg",
  10: "/activities/computer_work.jpg",
  11: "/activities/car_driving.jpg",
  12: "/activities/ascending_stairs.jpg",
  13: "/activities/descending_stairs.jpg",
  16: "/activities/vacuum_cleaning.jpg",
  17: "/activities/ironing.jpg",
  18: "/activities/folding_laundry.jpg",
  19: "/activities/house_cleaning.jpg",
  20: "/activities/playing_soccer.jpg",
  24: "/activities/rope_jumping.jpg",
};

export const post = async (url, data, config = {}) => {
  try {
    const response = await axios.post(url, data, config);
    return response;
  } catch (error) {
    console.error(`Error in POST request to ${url}:`, error);
    throw error;
  }
};

const PredictInterface = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handlePredict = async () => {
    try {
      const { data: apiData } = await post(
        "http://localhost:8001/predict/send",
        { input_data: query },
      );
      const { classes, probas } = apiData;

      // Create key-value pairs: class -> proba
      const classProbaMap = classes.map((cls, index) => ({
        class: cls,
        proba: probas[index],
      }));

      console.log("Prediction data:", classProbaMap);

      setData(classProbaMap); // Save the mapped data if needed
    } catch (error) {
      console.error("Error during prediction:", error);
    }
  };
  const getPrimaryClass = (arr) => {
    // Find the object with the maximum probability
    const maxProbaObj = arr.reduce((max, current) => {
      return current.proba > max.proba ? current : max;
    }, arr[0]);

    // Return the class and its probability
    return {
      class: maxProbaObj.class,
      proba: maxProbaObj.proba,
    };
  };

  const getThreeAlternatives = (arr) => {
    // Trier le tableau par probabilité, du plus élevé au plus bas
    const sortedArr = arr.sort((a, b) => b.proba - a.proba);

    // Exclure la classe principale (la première classe) et prendre les trois suivantes
    const alternatives = sortedArr.slice(1, 4);

    // Retourner la classe principale et les trois autres alternatives
    return {
      alternatives,
    };
  };
  if (data) {
    console.log(getPrimaryClass(data));
    console.log(getThreeAlternatives(data));
  }

  return (
    <DefaultLayout>
      <div className="p-5 space-y-10">
        <Card className="p-8" shadow="sm">
          <CardHeader className="flex justify-between items-center p-0 pb-4">
            <div>
              <h1 className="text-xl font-bold">Activity Prediction</h1>
              <p className="text-[.8rem] font-light text-default-500">
                Predict the activity according to the 52 features provided by
                the sensors
              </p>
            </div>
            <Button
              onPress={onOpen}
              isIconOnly
              variant="light"
              aria-label="Help"
              className="text-default-400 hover:text-default-500"
            >
              <HelpCircle className="w-6 h-6" />
            </Button>
          </CardHeader>
          <div className="px-0 py-4 space-y-3 grid grid-cols-12 items-center justify-center gap-5 w-3/4 m-auto">
            <div className="col-span-10">
              <Input
                value={query}
                onValueChange={setQuery}
                placeholder="Enter your data"
                startContent={
                  <BrainCircuit className="w-4 h-4 text-default-400" />
                }
                size="lg"
              />
            </div>

            <div className="col-span-2 !mt-0 h-full">
              <Button
                color="primary"
                className="w-full h-full"
                onPress={handlePredict}
                endContent={<Sparkles className="w-5 h-5" />}
                isDisabled={query === ""}
              >
                Predict
              </Button>
            </div>
          </div>
        </Card>

        {data && (
          <Card
            isBlurred
            className="border-none bg-background/60 dark:bg-default-100/50 w-3/4 m-auto"
            shadow="sm"
          >
            <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
              <div className="relative col-span-4 w-full h-full">
                <Image
                  alt="Prediction result"
                  className="object-cover w-full h-full"
                  classNames={{
                    wrapper: "w-full h-full",
                  }}
                  shadow="md"
                  src={activity_pictures[parseInt(getPrimaryClass(data).class)]}
                //src={getPrimaryClass(data)}
                />
              </div>
              <div className="flex flex-col col-span-8 w-full h-full">
                <div className="p-5 text-center bg-default-100 m-3 rounded-lg shadow">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-default-900">
                      {activity_names[parseInt(getPrimaryClass(data).class)] ||
                        "Activity"}
                    </h3>
                    <p className="text-default-600 mt-5">
                      {(getPrimaryClass(data).proba * 100).toFixed(2) || 90}%
                      Confidence
                    </p>
                  </div>
                  <Progress
                    value={(getPrimaryClass(data).proba * 100).toFixed(2) || 90}
                    size="sm"
                    color="success"
                  />
                </div>
                <div className="p-5">
                  <p className="mb-5">Alternative activities</p>
                  {getThreeAlternatives(data).alternatives.map((alt, index) => (
                    <div key={index} className="grid grid-cols-12 items-center">
                      <p className="col-span-8 text-default-500 font-light">
                        {activity_names[parseInt(alt.class)]}
                      </p>
                      <Tooltip
                        content={`${(alt.proba * 100).toFixed(2)}% confidence`}
                      >
                        <Progress
                          value={alt.proba * 100}
                          size="sm"
                          className="col-span-4"
                        />
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="right"
        size="4xl"
        aria-labelledby="query-guide-title"
      >
        <DrawerContent>
          <DrawerHeader>
            <h4 id="query-guide-title">Activity Prediction Guide</h4>
          </DrawerHeader>

          <DrawerBody>
            <h5>Overview</h5>
            <p>
              This guide explains how to retrieve activity insights using heart
              rate and other sensors data. The system processes heart rate
              trends and other sensor metrics to deliver actionable insights,
              helping users monitor performance, and make informed decisions
              effectively.
            </p>
            {/* <Spacer y={1} />

            <Divider />

            <Spacer y={0.5} />
            <h5>Features</h5>
            <ul style={{ paddingLeft: "1rem", lineHeight: "1.8" }}>
              <li>
                <b>Column Selection:</b> Specify the columns to retrieve. Use{" "}
                <code>*</code> for all columns.
              </li>
              <li>
                <b>WHERE Clauses:</b> Add conditions to filter data. Supports{" "}
                <code>AND</code>, <code>OR</code>, and nested conditions.
              </li>
              <li>
                <b>Sorting:</b> Use <code>sorted by</code> to sort results in
                ascending or descending order.
              </li>
              <li>
                <b>Limiting Results:</b> Limit the number of rows returned using
                the <code>limit</code> keyword.
              </li>
            </ul> */}
            <Spacer y={1} />
            <Divider />
            <Spacer y={0.5} />
            <h5>Syntax Examples</h5>
            To retrieve activity insights using heart rate and sensor data, you
            need to provide 52 ordered features separated by a comma (,). Each
            feature corresponds to a specific parameter collected by the
            sensors.
            <code>
              86.0,33.6875,-8.02352,3.22646,4.37356,-7.84454,3.23419,4.70615,
              ...
            </code>
            <Spacer y={1} />
            {/* <Divider />

            <Spacer y={0.5} />
            <p>Helpful Tips</p>
            <ul style={{ paddingLeft: "1rem", lineHeight: "1.8" }}>
              <li>
                Use single or double quotes for string values in conditions.
              </li>
              <li>Nested conditions require parentheses for grouping.</li>
              <li>Ensure all column names match the dataset schema.</li>
            </ul> */}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </DefaultLayout>
  );
};

export default PredictInterface;
