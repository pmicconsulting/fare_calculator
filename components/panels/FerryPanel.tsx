import React from "react";
import FerryForm from "../FerryForm";
import FerryMap from "../FerryMap";
import FerryFareResult from "../FerryFareResult";
import { VehicleType, RegionType } from "../../lib/codeMaps";

type Props = {
  vehicle: VehicleType;
  region: RegionType;
  useHighway: boolean;
  ferryResult: {
    beforeFare: number;
    afterFare: number;
    beforeKm: number;
    afterKm: number;
    beforeRoundedKm: number;
    afterRoundedKm: number;
    beforeOriginAddr: string;
    beforeDestAddr: string;
    afterOriginAddr: string;
    afterDestAddr: string;
  } | null;
  onFerryResult: (result: {
    beforeFare: number;
    afterFare: number;
    beforeKm: number;
    afterKm: number;
    beforeRoundedKm: number;
    afterRoundedKm: number;
    beforeOriginAddr: string;
    beforeDestAddr: string;
    afterOriginAddr: string;
    afterDestAddr: string;
  } | null, error?: string) => void;
  ferryMapRef: React.RefObject<{ calculateRoute: () => void }>;
};

const FerryPanel: React.FC<Props> = ({
  vehicle,
  region,
  useHighway,
  ferryResult,
  onFerryResult,
  ferryMapRef
}) => {
  return (
    <>
      <FerryForm vehicle={vehicle} region={region} />
      <FerryMap
        ref={ferryMapRef}
        vehicle={vehicle}
        region={region}
        useHighway={useHighway}
        origin=""
        embarkPort=""
        disembarkPort=""
        destination=""
        onResult={onFerryResult}
      />
      {ferryResult && (
        <FerryFareResult
          beforeFare={ferryResult.beforeFare}
          afterFare={ferryResult.afterFare}
          beforeKm={ferryResult.beforeKm}
          afterKm={ferryResult.afterKm}
          beforeRoundedKm={ferryResult.beforeRoundedKm}
          afterRoundedKm={ferryResult.afterRoundedKm}
          beforeOriginAddr={ferryResult.beforeOriginAddr}
          beforeDestAddr={ferryResult.beforeDestAddr}
          afterOriginAddr={ferryResult.afterOriginAddr}
          afterDestAddr={ferryResult.afterDestAddr}
          useHighway={useHighway}
          vehicle={vehicle}
          region={region}
        />
      )}
    </>
  );
};

export default FerryPanel;