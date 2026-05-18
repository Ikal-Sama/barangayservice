import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllEmergencyContacts } from "@/lib/actions/emergency-contacts";
import ContactsClient from "./contacts-client";

export const metadata: Metadata = { title: "Emergency Contacts" };

export default async function ContactsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") redirect("/login");

  const contacts = await getAllEmergencyContacts();

  return <ContactsClient initialContacts={contacts} />;
}
