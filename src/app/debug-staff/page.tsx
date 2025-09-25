'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface StaffMember {
  id?: string;
  full_name: string;
  role: string | null;
}

interface SubService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  service_id: string;
  is_active: boolean | null;
  created_at?: string | null;
}

interface StaffSubServiceAssignment {
  id?: string;
  staff_id: string;
  sub_service_id: string;
  experience_level: string | null;
  created_at?: string | null;
  staff?: StaffMember;
  sub_services?: { name: string };
}

interface SubServiceQuery {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  service_id: string;
  is_active: boolean | null;
  staff_sub_services: StaffSubServiceAssignment | StaffSubServiceAssignment[];
}

interface ProcessedSubService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  service_id: string;
  staff: StaffMember[];
  staff_count: number;
}

export default function DebugStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [assignments, setAssignments] = useState<StaffSubServiceAssignment[]>([]);
  const [subServiceQuery, setSubServiceQuery] = useState<SubServiceQuery[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedSubService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDebugData() {
      try {
        // Fetch all staff
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*');

        // Fetch all sub-services
        const { data: subServicesData, error: subServicesError } = await supabase
          .from('sub_services')
          .select('*');

        // Fetch all staff-sub-service assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('staff_sub_services')
          .select('*, staff(full_name, role), sub_services(name)');

        // Test the exact query from the sub-services page
        const { data: subServiceQueryData, error: subServiceQueryError } = await supabase
          .from('sub_services')
          .select(`
            id,
            name,
            description,
            price,
            duration_minutes,
            image_url,
            service_id,
            is_active,
            staff_sub_services!inner (
              staff!inner (
                id,
                full_name,
                role
              )
            )
          `)
          .eq('is_active', true)
          .order('name');

        if (staffError) console.error('Staff error:', staffError);
        if (subServicesError) console.error('Sub-services error:', subServicesError);
        if (assignmentsError) console.error('Assignments error:', assignmentsError);
        if (subServiceQueryError) console.error('Sub-service query error:', subServiceQueryError);

        setStaff((staffData as StaffMember[]) || []);
        setSubServices((subServicesData as SubService[]) || []);
        setAssignments((assignmentsData as StaffSubServiceAssignment[]) || []);
        setSubServiceQuery((subServiceQueryData as SubServiceQuery[]) || []);

        // Process the data exactly like the sub-services page does
        if (subServiceQueryData) {
          const processedSubServices = subServiceQueryData.reduce((acc: ProcessedSubService[], current: Record<string, unknown>) => {
            const existing = acc.find(item => item.id === (current.id as string));

            // Normalize staff_sub_services to an array
            const staffSubServices = current.staff_sub_services as StaffSubServiceAssignment[] | StaffSubServiceAssignment | undefined;
            const sssArray = Array.isArray(staffSubServices)
              ? staffSubServices
              : staffSubServices
                ? [staffSubServices]
                : [];

            // Extract staff members
            const extractedStaff = sssArray
              .map((row: StaffSubServiceAssignment) => row?.staff)
              .filter((s): s is StaffMember => !!s && !!s.id)
              .map((s: StaffMember) => ({ id: s.id, full_name: s.full_name, role: s.role }));

            if (existing) {
              extractedStaff.forEach((staffMember: StaffMember) => {
                if (!existing.staff?.find((s: StaffMember) => s.id === staffMember.id)) {
                  existing.staff = [...(existing.staff || []), staffMember];
                }
              });
            } else {
              acc.push({
                id: current.id as string,
                name: current.name as string,
                description: current.description as string | null,
                price: current.price as number,
                duration_minutes: current.duration_minutes as number,
                image_url: current.image_url as string | null,
                service_id: current.service_id as string,
                staff: extractedStaff,
                staff_count: extractedStaff.length
              });
            }

            return acc;
          }, []);

          // Apply the same filtering
          const filteredSubServices = processedSubServices.map(subService => {
            const visibleStaff = (subService.staff || []).filter((staff: StaffMember) => {
              const role = (staff.role || '').toLowerCase().trim();
              return role !== 'admin' && role !== 'manager';
            });
            return {
              ...subService,
              staff: visibleStaff,
              staff_count: visibleStaff.length
            };
          });

          setProcessedData(filteredSubServices);
        }
      } catch (error) {
        console.error('Debug fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDebugData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading debug data...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Staff & Sub-Service Debug Page</h1>
      
      <h2>Staff Members ({staff.length})</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
        {JSON.stringify(staff, null, 2)}
      </pre>

      <h2>Sub-Services ({subServices.length})</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
        {JSON.stringify(subServices, null, 2)}
      </pre>

      <h2>Staff-Sub-Service Assignments ({assignments.length})</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
        {JSON.stringify(assignments, null, 2)}
      </pre>

      <h2>Sub-Service Query Result (with inner joins) ({subServiceQuery.length})</h2>
      <pre style={{ background: '#ffe6e6', padding: '1rem', overflow: 'auto' }}>
        {JSON.stringify(subServiceQuery, null, 2)}
      </pre>

      <h2>Processed & Filtered Data (final result) ({processedData.length})</h2>
      <pre style={{ background: '#e6ffe6', padding: '1rem', overflow: 'auto' }}>
        {JSON.stringify(processedData, null, 2)}
      </pre>

      <h2>Analysis</h2>
      <div style={{ background: '#e6f3ff', padding: '1rem', marginTop: '1rem' }}>
        <p><strong>Total Staff:</strong> {staff.length}</p>
        <p><strong>Staff by Role:</strong></p>
        <ul>
          {Array.from(new Set(staff.map(s => s.role || 'null'))).map(role => (
            <li key={role}>
              {role}: {staff.filter(s => (s.role || 'null') === role).length}
            </li>
          ))}
        </ul>
        
        <p><strong>Total Sub-Services:</strong> {subServices.length}</p>
        <p><strong>Total Assignments:</strong> {assignments.length}</p>
        <p><strong>Sub-Service Query Results:</strong> {subServiceQuery.length}</p>
        <p><strong>Processed & Filtered Results:</strong> {processedData.length}</p>
        
        <p><strong>Sub-Services with No Staff (from basic query):</strong></p>
        <ul>
          {subServices.filter(ss => !assignments.some(a => a.sub_service_id === ss.id)).map(ss => (
            <li key={ss.id}>{ss.name}</li>
          ))}
        </ul>
        
        <p><strong>Why sub-services might not show (Debugging):</strong></p>
        <div style={{ background: '#fff3cd', padding: '1rem', margin: '1rem 0', borderRadius: '4px' }}>
          {subServiceQuery.length === 0 ? (
            <p>❌ <strong>ISSUE FOUND:</strong> The inner join query returns 0 results. This means:</p>
          ) : (
            <p>✅ Inner join query works - returns {subServiceQuery.length} results</p>
          )}
          
          {assignments.length > 0 && subServiceQuery.length === 0 && (
            <div>
              <p><strong>Possible causes:</strong></p>
              <ul>
                <li>Sub-service is_active = false</li>
                <li>Staff member was deleted but assignment remains</li>
                <li>Foreign key relationship issue</li>
              </ul>
            </div>
          )}
          
          {processedData.length > 0 && processedData.every((ss: ProcessedSubService) => ss.staff_count === 0) && (
            <p>❌ <strong>ISSUE FOUND:</strong> All staff filtered out (all are admin/manager)</p>
          )}
        </div>

        <p><strong>Non-Admin/Manager Staff Available:</strong></p>
        <ul>
          {staff.filter(s => {
            const role = (s.role || '').toLowerCase();
            return role !== 'admin' && role !== 'manager';
          }).map(s => (
            <li key={s.id}>{s.full_name} - {s.role || 'no role'}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}