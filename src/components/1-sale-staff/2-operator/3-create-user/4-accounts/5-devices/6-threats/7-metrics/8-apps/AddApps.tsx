"use client";

import { useEffect, useState } from "react";
import "../../../../../../../../../app/App.scss";
import axios from "axios";
import { LoadingSpinner } from "../../../../../../../../spinner/Spinner";
import toast from "react-hot-toast";

interface AddAppsProps {
  nextBtn: () => void;
  backBtn: () => void;
  operatorId: string;
  apiURL: string;
  token: string;
  header: {
    "auth-token": string;
  };
}

export const AddApps: React.FC<AddAppsProps> = ({
  nextBtn,
  backBtn,
  operatorId,
  apiURL,
  token,
  header,
}) => {
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileApps, setMobileApps] = useState<any[]>([]);
  const [deviceId, setDeviceId] = useState<number[]>([]);
  const [deviceAppMapping, setDeviceAppMapping] = useState<
    { deviceId: number; appName: string }[]
  >([]);

  const randomNum = Math.floor(Math.random() * 3) + 2;

  const deviceIdOperator: any = `/op/operatordevices/${operatorId}?size=100000`;

  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        const response = await axios.get(apiURL + deviceIdOperator, {
          headers: header,
        });
        const data = response.data;
        const ids = data.data.map((item: { ID: number }) => item.ID);
        setDeviceId(ids);
      } catch (error) {
        console.log("Error fetching device IDs:", error);
      }
    };
    fetchDeviceId();
  }, [apiURL, deviceIdOperator, header]);

  useEffect(() => {
    const fetchMobileApps = async () => {
      try {
        const response = await axios.get(
          `${apiURL}/v2/op/demo-suite/mobile-apps`,
          {
            headers: header,
          }
        );
        setMobileApps(response.data);
      } catch (err) {
        console.log(`Error fetching mobile apps: ${err}`);
      }
    };

    fetchMobileApps();
  }, [apiURL, header]);

  useEffect(() => {
    if (deviceId.length > 0 && mobileApps.length > 0 && randomNum > 0) {
      const newDeviceAppMapping:
        | ((
            prevState: { deviceId: number; appName: string; appType: string }[]
          ) => { deviceId: number; appName: string; appType: string }[])
        | { deviceId: number; appName: any; appType: string }[] = [];
      deviceId.forEach((device) => {
        for (let i = 0; i < randomNum; i++) {
          const randomAppIndex = Math.floor(Math.random() * mobileApps.length);
          newDeviceAppMapping.push({
            deviceId: device,
            appName: mobileApps[randomAppIndex].packageName,
            appType: "user",
          });
        }
      });
      setDeviceAppMapping(newDeviceAppMapping);
    }
  }, [deviceId, mobileApps, randomNum]);

  const handleSubmit = async () => {
    const chunkSize = 100;
    const chunks = [];
    try {
      for (let i = 0; i < deviceAppMapping.length; i += chunkSize) {
        chunks.push(deviceAppMapping.slice(i, i + chunkSize));
      }

      for (let i = 0; i < chunks.length; i++) {
        const response = await axios.post(
          `${apiURL}/v2/op/demo-suite/device-apps`,
          chunks[i],
          {
            headers: header,
          }
        );
        console.log("Successfully generated device apps: ");
        console.log(response.data);
      }
      toast.success("Successfully generated device apps");
      setIsButtonDisabled(false);
    } catch (err) {
      console.log(`Error generating device apps: ${err}`);
      toast.error("Failed generating device apps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {}, [apiURL, token, deviceIdOperator, header]);

  return (
    <div className="common-container">
      <div className="common-container-header">
        <h1>Add Apps to Devices</h1>
      </div>

      <div className="common-container-body">
        <label>Add apps to devices</label>
        <button type="submit" onClick={handleSubmit}>
          ADD APPS
        </button>
        <LoadingSpinner loading={loading} />
      </div>

      <div className="common-container-footer">
        <button onClick={backBtn}>BACK</button>
        <button onClick={nextBtn} type="submit" disabled={isButtonDisabled}>NEXT</button>
      </div>
    </div>
  );
};
