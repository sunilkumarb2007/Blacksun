import React from "react";
import { TelemetryProvider, useTelemetry } from "../context/TelemetryContext";
import { Header } from "../components/blacksun/Header";
import { Sidebar } from "../components/blacksun/Sidebar";
import { MissionControl } from "../components/blacksun/MissionControl";
import { CommunicationLink } from "../components/blacksun/CommunicationLink";
import { LiveTelemetry } from "../components/blacksun/LiveTelemetry";
import { MotorHealth } from "../components/blacksun/MotorHealth";
import { SurvivalDecisionEngine } from "../components/blacksun/SurvivalDecisionEngine";
import { ActionReason } from "../components/blacksun/ActionReason";
import { ActuatorsStatus } from "../components/blacksun/ActuatorsStatus";
import { Footer } from "../components/blacksun/Footer";
import { CrisisDemoBar } from "../components/blacksun/CrisisDemoBar";
import { DataChartsModal } from "../components/blacksun/DataChartsModal";
import { InfoModal } from "../components/blacksun/InfoModal";

// Sub-pages 02 - 09
import { LiveTelemetryPage } from "./LiveTelemetryPage";
import { MotorHealthPage } from "./MotorHealthPage";
import { SurvivalEnginePage } from "./SurvivalEnginePage";
import { CommunicationPage } from "./CommunicationPage";
import { EventLogPage } from "./EventLogPage";
import { SystemArchitecturePage } from "./SystemArchitecturePage";
import { DataValidationPage } from "./DataValidationPage";
import { SettingsPage } from "./SettingsPage";

const DashboardContent: React.FC = () => {
  const { activePage } = useTelemetry();

  const renderActivePage = () => {
    switch (activePage) {
      case "02":
        return <LiveTelemetryPage />;
      case "03":
        return <MotorHealthPage />;
      case "04":
        return <SurvivalEnginePage />;
      case "05":
        return <CommunicationPage />;
      case "06":
        return <EventLogPage />;
      case "07":
        return <SystemArchitecturePage />;
      case "08":
        return <DataValidationPage />;
      case "09":
        return <SettingsPage />;
      case "01":
      default:
        return (
          <main className="flex-1 flex flex-col overflow-y-auto bg-[#E8E7DF]">
            {/* ROW 1: Mission Control (67%) & Communication Link (33%) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#B5B3A7] min-h-[178px]">
              <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[#B5B3A7]">
                <MissionControl />
              </div>
              <div className="lg:col-span-4">
                <CommunicationLink />
              </div>
            </section>

            {/* ROW 2: Live Telemetry (67%) & Motor Health (33%) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#B5B3A7] min-h-[168px]">
              <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[#B5B3A7]">
                <LiveTelemetry />
              </div>
              <div className="lg:col-span-4">
                <MotorHealth />
              </div>
            </section>

            {/* ROW 3: Survival Decision Engine (42%), Why This Action? (32%), Actuators Status (26%) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[210px]">
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#B5B3A7]">
                <SurvivalDecisionEngine />
              </div>
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#B5B3A7]">
                <ActionReason />
              </div>
              <div className="lg:col-span-3">
                <ActuatorsStatus />
              </div>
            </section>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E7DF] text-[#182226] flex flex-col justify-between select-none relative font-sans antialiased">
      {/* Top Header */}
      <Header />

      {/* Main Body: Sidebar + Active View Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        <Sidebar />
        {renderActivePage()}
      </div>

      {/* Bottom Bar Footer */}
      <Footer />

      {/* Global Interactive Elements */}
      <CrisisDemoBar />
      <DataChartsModal />
      <InfoModal />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <TelemetryProvider>
      <DashboardContent />
    </TelemetryProvider>
  );
};

export default Index;
