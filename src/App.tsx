import { useState, useEffect, MouseEvent } from "react";
import image from "./assets/0-floor.png";
import svgOverlay from "./assets/0-floor.svg";
import data from "./assets/data.json";

interface PolygonData {
  code: number;
  status: string;
  price: number;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

function App() {
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  const [polygonData, setPolygonData] = useState<PolygonData[]>([]);
  const [filteredData, setFilteredData] = useState<PolygonData[]>([]);

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([
    0, 100000,
  ]);

  useEffect(() => {
    setPolygonData(data);
    setFilteredData(data);
    console.log("useEffect");
  }, []);

  const handleMouseOver = (event: MouseEvent<SVGPolygonElement>) => {
    const polygon = event.target as SVGPolygonElement;
    const code = parseInt(polygon.getAttribute("data-code") || "0");

    const polygonInfo = filteredData.find((item) => item.code === code);

    if (polygonInfo) {
      setTooltipData({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        content: `Status: ${polygonInfo.status}\nPrice: LE ${polygonInfo.price}`,
      });
    }
  };

  const handleMouseMove = (event: MouseEvent<SVGPolygonElement>) => {
    setTooltipData((prev) => ({
      ...prev,
      x: event.clientX,
      y: event.clientY,
    }));
  };

  const handleMouseOut = () => {
    setTooltipData({ visible: false, x: 0, y: 0, content: "" });
  };

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  const applyFilters = () => {
    const filtered = polygonData.filter((polygon) => {
      const isStatusMatch = filterStatus
        ? polygon.status === filterStatus
        : true;
      const isPriceMatch =
        polygon.price >= filterPriceRange[0] &&
        polygon.price <= filterPriceRange[1];
      return isStatusMatch && isPriceMatch;
    });

    setFilteredData(filtered);

    const svgDoc = document.querySelector("object")?.contentDocument;
    if (svgDoc) {
      updateSVGPolygons(svgDoc);
    }

    setIsPopupVisible(false);
  };

  const updateSVGPolygons = (svgDoc: Document) => {
    const polygons = svgDoc.querySelectorAll("polygon");

    polygons.forEach((polygon) => {
      const code = parseInt(polygon.getAttribute("data-code") || "0");
      const polygonInfo = filteredData.find((item) => item.code === code);

      if (polygonInfo) {
        polygon.setAttribute("fill", "#3271cc");
        polygon.style.display = "block";
      } else {
        polygon.style.display = "none";
      }
    });
  };

  useEffect(() => {
    const svgDoc = document.querySelector("object")?.contentDocument;
    if (svgDoc) {
      updateSVGPolygons(svgDoc);
    }
  }, [filteredData]);

  return (
    <>
      <img
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "#272727",
          objectFit: "contain",
        }}
        src={image}
        alt="Background"
      />
      <object
        type="image/svg+xml"
        data={svgOverlay}
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onLoad={(e) => {
          const svgDoc = (e.target as HTMLObjectElement).contentDocument;
          if (svgDoc) {
            updateSVGPolygons(svgDoc);
            const polygons = svgDoc.querySelectorAll("polygon");

            polygons.forEach((polygon) => {
              polygon.addEventListener(
                "mouseover",
                handleMouseOver as unknown as EventListener
              );
              polygon.addEventListener(
                "mousemove",
                handleMouseMove as unknown as EventListener
              );
              polygon.addEventListener(
                "mouseout",
                handleMouseOut as unknown as EventListener
              );
            });
          }
        }}
        aria-label="SVG Overlay"
      />
      {tooltipData.visible && (
        <div
          style={{
            position: "fixed",
            top: tooltipData.y + 10,
            left: tooltipData.x + 10,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            padding: "8px",
            borderRadius: "4px",
            whiteSpace: "pre-line",
            zIndex: 1000,
          }}
        >
          {tooltipData.content}
        </div>
      )}
      <button
        onClick={togglePopup}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          backgroundColor: "#fff",
          border: "none",
          borderRadius: "50%",
          padding: "10px",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <span>⚙️</span>
      </button>
      {isPopupVisible && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 2000,
            width: "300px",
          }}
        >
          <h3>Filter by</h3>
          <div>
            <label>Status:</label>
            <select
              title="sel"
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
          <div>
            <label>Price Range:</label>
            <input
              placeholder="5"
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={filterPriceRange[0]}
              onChange={(e) =>
                setFilterPriceRange([
                  parseInt(e.target.value),
                  filterPriceRange[1],
                ])
              }
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <input
              placeholder="10"
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={filterPriceRange[1]}
              onChange={(e) =>
                setFilterPriceRange([
                  filterPriceRange[0],
                  parseInt(e.target.value),
                ])
              }
              style={{ width: "100%", marginBottom: "10px" }}
            />
          </div>
          <button
            onClick={applyFilters}
            style={{
              backgroundColor: "#3271cc",
              color: "#fff",
              padding: "8px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Apply Filters
          </button>
        </div>
      )}
    </>
  );
}

export default App;
