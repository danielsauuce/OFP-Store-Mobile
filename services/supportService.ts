import { AxiosError } from 'axios';
import axiosInstance from './axiosInstance';

export async function createTicketService(ticketData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.post('/api/support', ticketData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('createTicket error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function getMyTicketsService() {
  try {
    const { data } = await axiosInstance.get('/api/support/my-tickets');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getMyTickets error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function getTicketByIdService(ticketId: string) {
  try {
    const { data } = await axiosInstance.get(`/api/support/${ticketId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getTicketById error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function addTicketReplyService(ticketId: string, text: string) {
  try {
    const { data } = await axiosInstance.post(`/api/support/${ticketId}/reply`, { text });
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('addTicketReply error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
