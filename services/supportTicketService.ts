import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

export type TicketStatus = 'new' | 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface TicketReply {
  _id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  replies: TicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  subject: string;
  message: string;
}

export async function createTicketService(payload: CreateTicketPayload): Promise<{ ticket: SupportTicket }> {
  try {
    const { data } = await axiosInstance.post('/api/support', payload);
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    throw new Error(err.response?.data?.message ?? 'Could not create ticket');
  }
}

export async function getMyTicketsService(): Promise<{ tickets: SupportTicket[] }> {
  try {
    const { data } = await axiosInstance.get('/api/support/my-tickets');
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    throw new Error(err.response?.data?.message ?? 'Could not fetch tickets');
  }
}

export async function getTicketByIdService(ticketId: string): Promise<{ ticket: SupportTicket }> {
  try {
    const { data } = await axiosInstance.get(`/api/support/${ticketId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    throw new Error(err.response?.data?.message ?? 'Could not fetch ticket');
  }
}

export async function replyToTicketService(
  ticketId: string,
  message: string,
): Promise<{ ticket: SupportTicket }> {
  try {
    const { data } = await axiosInstance.post(`/api/support/${ticketId}/reply`, { text: message });
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    throw new Error(err.response?.data?.message ?? 'Could not send reply');
  }
}
