import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { formatRoomId } from '../utils/formatRoomId';



const DatabaseContext = createContext(null);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(!isSupabaseConfigured);

  // States — all start empty; populated exclusively from Supabase on load
  const [locations, setLocations] = useState([]);
  const [nodes, setNodes] = useState({});
  const [edges, setEdges] = useState([]);
  const [indoorNodes, setIndoorNodes] = useState({});
  const [indoorEdges, setIndoorEdges] = useState([]);
  const [chavaraIndoorNodes, setChavaraIndoorNodes] = useState({});
  const [chavaraIndoorEdges, setChavaraIndoorEdges] = useState([]);
  const [qrLocations, setQrLocations] = useState([]);
  const [bottomSheetData, setBottomSheetData] = useState({ departments: [], classrooms: [] });
  const [dbRooms, setDbRooms] = useState([]);

  // Re-fetch individual tables to guarantee alignment with realtime updates
  const fetchLocations = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('locations').select('*');
    if (error) throw error;
    setLocations(data.map(loc => ({
      id: loc.id,
      name: loc.name,
      position: [loc.lat, loc.lng],
      routeNode: loc.route_node
    })));
  };

  const fetchOutdoorNodes = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('outdoor_nodes').select('*');
    if (error) throw error;
    const nodeObj = {};
    data.forEach(node => {
      nodeObj[node.id] = [node.lat, node.lng];
    });
    setNodes(nodeObj);
  };

  const fetchOutdoorEdges = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('outdoor_edges').select('source, target');
    if (error) throw error;
    setEdges(data.map(edge => [edge.source, edge.target]));
  };

  const fetchIndoorNodes = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('indoor_nodes').select('*');
    if (error) throw error;
    
    const stmarys = {};
    const chavara = {};
    
    data.forEach(node => {
      // Use DB data only — no static fallback merging
      const formatted = {
        id: node.id,
        floor: node.floor,
        position: [node.lat, node.lng],
        ...(node.label ? { label: node.label } : {}),
        ...(node.label_lat != null && node.label_lng != null
          ? { labelPosition: [node.label_lat, node.label_lng] }
          : {})
      };

      if (node.building === 'stmarys') {
        stmarys[node.id] = formatted;
      } else {
        chavara[node.id] = formatted;
      }
    });

    setIndoorNodes(stmarys);
    setChavaraIndoorNodes(chavara);
  };


  const fetchIndoorEdges = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('indoor_edges').select('building, source, target');
    if (error) throw error;
    
    const stmarys = [];
    const chavara = [];
    
    data.forEach(edge => {
      const pair = [edge.source, edge.target];
      const b = (edge.building || "").toLowerCase();
      if (b.includes('chavara')) {
        chavara.push(pair);
      } else {
        stmarys.push(pair);
      }
    });
    
    setIndoorEdges(stmarys);
    setChavaraIndoorEdges(chavara);
  };

  const fetchQrLocations = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('qr_locations').select('*');
    if (error) throw error;
    setQrLocations(data.map(qr => ({
      id: qr.id,
      name: qr.name,
      position: [qr.lat, qr.lng],
      startNode: qr.start_node,
      type: qr.type,
      ...(qr.floor ? { floor: qr.floor } : {}),
      ...(qr.building ? { building: qr.building } : {})
    })));
  };


  const fetchRooms = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) throw error;
    
    // Auto-migrate legacy N/F prefixes to SM/CH for frontend display
    const cleanedData = (data || []).map(room => ({
      ...room,
      name: formatRoomId(room.name)
    }));
    setDbRooms(cleanedData);
  };

  // Returns a sort rank so faculties appear in order: HOD → Deputy HOD → everyone else
  const getFacultyRank = (designation = '') => {
    const d = designation.toLowerCase();
    if (d.includes('hod') && !d.includes('deputy') && !d.includes('asst')) return 0;
    if (d.includes('deputy') || (d.includes('asst') && d.includes('hod'))) return 1;
    return 2;
  };

  const fetchBottomSheetData = async () => {
    if (!isSupabaseConfigured) return;
    const { data: depts, error: deptError } = await supabase.from('departments').select('*').order('name');
    if (deptError) throw deptError;
    const { data: facs, error: facError } = await supabase.from('faculties').select('*');
    if (facError) throw facError;
    
    const departments = depts.map(dept => {
      const faculties = facs
        .filter(f => f.department_id === dept.id)
        .map(f => ({
          name: f.name,
          designation: f.designation,
          room: formatRoomId(f.room) || undefined,
          floor: f.floor || undefined,
          building: f.building || undefined,
          hasIndoorNavigation: f.has_indoor_navigation,
          routeNode: f.route_node || undefined,
          indoorNode: f.indoor_node || undefined
        }))
        .sort((a, b) => {
          const rankDiff = getFacultyRank(a.designation) - getFacultyRank(b.designation);
          if (rankDiff !== 0) return rankDiff;
          return (a.name || '').localeCompare(b.name || '');  // alphabetical within same rank
        });
      return {
        id: dept.id,
        name: dept.name,
        faculties,
        building: dept.building || undefined,
        floor: dept.floor || undefined,
        room: dept.room || undefined,
        routeNode: dept.route_node || undefined,
        indoorNode: dept.indoor_node || undefined,
        hasIndoorNavigation: dept.has_indoor_navigation || false
      };
    });
    
    // Also fetch rooms for the Classrooms tab in BottomSheet
    const { data: roomsData } = await supabase.from('rooms').select('*');
    const classrooms = (roomsData || []).map(r => {
      const cleanName = formatRoomId(r.name);
      return {
        id: r.room_id,
        name: cleanName,
        title: cleanName,
        description: `Room ${cleanName}`,
        floor: r.floor,
        building: r.building,
        room: r.room_id,
        indoorNode: r.indoor_node,
        routeNode: r.route_node
      };
    });

    const { data: locationsData } = await supabase.from('locations').select('*');
    const outdoorLocations = (locationsData || []).map(l => ({
      id: l.id,
      name: l.name,
      title: l.name,
      description: 'Outdoor Location',
      building: l.id,
      routeNode: l.route_node || l.id
    }));

    const labs = classrooms.filter(r => r.name?.toLowerCase()?.includes('lab'));
    const library = classrooms.filter(r => r.name?.toLowerCase()?.includes('library') || r.name?.toLowerCase()?.includes('lib'));
    
    const indoorCafeterias = classrooms.filter(r => r.name?.toLowerCase()?.includes('canteen') || r.name?.toLowerCase()?.includes('cafe'));
    const outdoorCafeterias = outdoorLocations.filter(l => l.name?.toLowerCase()?.includes('canteen') || l.name?.toLowerCase()?.includes('cafe'));
    
    const cafeteria = [...outdoorCafeterias, ...indoorCafeterias];

    setBottomSheetData({
      departments,
      classrooms,
      labs,
      library,
      cafeteria
    });
  };

  const loadAllData = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      await Promise.all([
        fetchLocations(),
        fetchOutdoorNodes(),
        fetchOutdoorEdges(),
        fetchIndoorNodes(),
        fetchIndoorEdges(),
        fetchQrLocations(),
        fetchBottomSheetData(),
        fetchRooms()
      ]);
      setUsingFallback(false);
    } catch (err) {
      console.error("Failed to load data from Supabase. Falling back to static data.", err);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    
    if (!isSupabaseConfigured) return;

    // Realtime channel subscriptions
    const sub = supabase.channel('supabase-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
        fetchLocations().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outdoor_nodes' }, () => {
        fetchOutdoorNodes().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outdoor_edges' }, () => {
        fetchOutdoorEdges().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'indoor_nodes' }, () => {
        fetchIndoorNodes().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'indoor_edges' }, () => {
        fetchIndoorEdges().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'qr_locations' }, () => {
        fetchQrLocations().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, () => {
        fetchBottomSheetData(),
        fetchRooms().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faculties' }, () => {
        fetchBottomSheetData(),
        fetchRooms().catch(console.error);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchRooms().catch(console.error);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  // Compute SEARCH_ITEMS dynamically from state using useMemo (replaces searchData.js logic)
  const searchItems = useMemo(() => {
    const roomItems = [];

    // Rooms come exclusively from the `rooms` table in the database.
    // No static fallback — if the table is empty or still loading, no rooms are shown.
    dbRooms.forEach(room => {
      roomItems.push({
        id: room.room_id,
        name: room.name,
        type: "room",
        floor: room.floor,
        routeNode: room.route_node,
        building: room.building,
        ...(room.indoor_node ? { indoorNode: room.indoor_node } : {})
      });
    });

    const facultyItems = [];
    bottomSheetData.departments.forEach((department) => {
      department.faculties.forEach((faculty) => {
        facultyItems.push({
          id: faculty.name,
          name: faculty.name,
          type: "faculty",
          department: department.name,
          room: faculty.room || null,
          floor: faculty.floor || null,
          building: faculty.building || (faculty.room ? "stmarys" : "chavara"),
          routeNode: faculty.routeNode || (faculty.room ? "g" : "chavara"),
          indoorNode: faculty.indoorNode || (faculty.room ? faculty.room : "chavara"),
          designation: faculty.designation,
          locationType: faculty.room ? "ROOM" : "chavara",
        });
      });
    });

    return [
      ...locations,
      ...roomItems,
      ...facultyItems,
    ];
  }, [locations, bottomSheetData, dbRooms]);

  return (
    <DatabaseContext.Provider
      value={{
        loading,
        usingFallback,
        locations,
        nodes,
        edges,
        indoorNodes,
        indoorEdges,
        chavaraIndoorNodes,
        chavaraIndoorEdges,
        qrLocations,
        bottomSheetData,
        searchItems,
        rooms: dbRooms,
        reloadData: loadAllData
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
